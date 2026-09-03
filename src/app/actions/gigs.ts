"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser, requirePermission } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { siteUrl } from "@/lib/format";
import { notify } from "@/lib/notifications";
import { sentenceCase } from "@/lib/titlecase";
import {
  GIG_MAX_USD,
  GIG_MIN_USD,
  MAX_DELIVERY_DAYS,
  MAX_GIGS_PER_SELLER,
  MAX_GIG_FAQ,
  MAX_GIG_IMAGES,
  MAX_GIG_TAGS,
  MAX_REVISIONS,
  TIERS,
  TIER_LABEL,
  type GigFaq,
  autoReleaseDate,
  gigFeeMinor,
  refundGigOrder,
  releaseGigOrder,
  sellerShareMinor,
  uniqueGigSlug,
  usd,
} from "@/lib/gigs";

const priceSchema = z.coerce
  .number()
  .int("Whole dollars only")
  .min(GIG_MIN_USD, `Gigs start at $${GIG_MIN_USD}`)
  .max(GIG_MAX_USD, `Gigs are capped at $${GIG_MAX_USD}`);

const packageSchema = z.object({
  tier: z.enum(["BASIC", "STANDARD", "PREMIUM"]),
  name: z.string().trim().min(2, "Name each package").max(40),
  description: z
    .string()
    .trim()
    .min(10, "Say in a line what each package gets the buyer")
    .max(300),
  includes: z.string().trim().max(1000).optional(),
  priceUsd: priceSchema,
  deliveryDays: z.coerce.number().int().min(1).max(MAX_DELIVERY_DAYS),
  revisions: z.coerce.number().int().min(0).max(MAX_REVISIONS),
});

const gigSchema = z.object({
  title: z.string().trim().min(6, "Give the gig a clear title").max(80),
  description: z
    .string()
    .trim()
    .min(40, "Say what you will do in at least a couple of sentences")
    .max(3000),
  tags: z.array(z.string().trim().min(2).max(30)).max(MAX_GIG_TAGS),
  images: z.array(z.string().url()).max(MAX_GIG_IMAGES),
  faq: z
    .array(
      z.object({
        q: z.string().trim().min(5, "Write the question in full").max(160),
        a: z.string().trim().min(5, "Answer each question").max(600),
      }),
    )
    .max(MAX_GIG_FAQ),
  packages: z
    .array(packageSchema)
    .min(1, "Fill in at least the Basic package")
    .max(3)
    .refine(
      (list) => list.some((p) => p.tier === "BASIC"),
      "The Basic package is required",
    )
    .refine((list) => {
      const prices = TIERS.filter((t) => list.some((p) => p.tier === t)).map(
        (t) => list.find((p) => p.tier === t)!.priceUsd,
      );
      return prices.every((p, i) => i === 0 || p >= prices[i - 1]);
    }, "Standard must cost at least as much as Basic, and Premium at least Standard"),
});

function firstIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Please check the form.";
}

function strings(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((v) => String(v).trim())
    .filter(Boolean);
}

/** Only pictures the seller uploaded here (blob path gigs/<userId>/…) are accepted. */
function ownGigImage(url: string, userId: string) {
  try {
    const { hostname, pathname } = new URL(url);
    return (
      hostname.endsWith(".public.blob.vercel-storage.com") &&
      pathname.startsWith(`/gigs/${userId}/`)
    );
  } catch {
    return false;
  }
}

/** Reads the whole gig editor form. Packages are keyed pkg_<TIER>_<field>. */
function readGigForm(formData: FormData, userId: string) {
  const packages = TIERS.filter(
    (tier) => tier === "BASIC" || formData.get(`pkg_${tier}_on`) === "1",
  ).map((tier) => ({
    tier,
    name: formData.get(`pkg_${tier}_name`) || TIER_LABEL[tier],
    description: formData.get(`pkg_${tier}_description`),
    includes: formData.get(`pkg_${tier}_includes`) ?? undefined,
    priceUsd: formData.get(`pkg_${tier}_priceUsd`),
    deliveryDays: formData.get(`pkg_${tier}_deliveryDays`),
    revisions: formData.get(`pkg_${tier}_revisions`) || 0,
  }));
  const questions = formData.getAll("faq_q").map(String);
  const answers = formData.getAll("faq_a").map(String);
  const faq = questions
    .map((q, i) => ({ q: q.trim(), a: (answers[i] ?? "").trim() }))
    .filter((row) => row.q || row.a);
  const tags = Array.from(
    new Set(
      String(formData.get("tags") ?? "")
        .split(/[,\n]/)
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    ),
  );
  return gigSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    tags,
    images: strings(formData, "images").filter((url) => ownGigImage(url, userId)),
    faq,
    packages,
  });
}

type GigInput = z.infer<typeof gigSchema>;

/** Top-level price/delivery/includes mirror the cheapest package for cards and lists. */
function gigColumns(data: GigInput) {
  const basic = data.packages.find((p) => p.tier === "BASIC")!;
  const faq: GigFaq[] = data.faq;
  return {
    title: sentenceCase(data.title),
    description: data.description,
    includes: basic.includes || null,
    priceMinor: Math.min(...data.packages.map((p) => p.priceUsd)) * 100,
    deliveryDays: basic.deliveryDays,
    tags: data.tags,
    images: data.images,
    faq,
  };
}

function packageRows(data: GigInput) {
  return data.packages.map((p) => ({
    tier: p.tier,
    name: p.name,
    description: p.description,
    includes: p.includes || null,
    priceMinor: p.priceUsd * 100,
    deliveryDays: p.deliveryDays,
    revisions: p.revisions,
  }));
}

function revalidateGig(slug: string, username: string | null) {
  revalidatePath("/gigs");
  revalidatePath(`/gigs/${slug}`);
  revalidatePath("/dashboard/gigs");
  if (username) revalidatePath(`/${username}`);
}

export async function createGigAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    if (!user.emailVerifiedAt) {
      return { error: "Verify your email before selling a gig." };
    }
    const parsed = readGigForm(formData, user.id);
    if (!parsed.success) return { error: firstIssue(parsed.error) };

    const live = await db.gig.count({
      where: { sellerId: user.id, status: { not: "REMOVED" } },
    });
    if (live >= MAX_GIGS_PER_SELLER) {
      return { error: `You can list up to ${MAX_GIGS_PER_SELLER} gigs.` };
    }

    const slug = await uniqueGigSlug(parsed.data.title, user.name);
    await db.gig.create({
      data: {
        slug,
        sellerId: user.id,
        ...gigColumns(parsed.data),
        packages: { create: packageRows(parsed.data) },
      },
    });
    revalidateGig(slug, user.username);
    return { success: "Your gig is live." };
  } catch (error) {
    return fieldError(error);
  }
}

export async function updateGigAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const id = String(formData.get("gigId") ?? "");
    const gig = await db.gig.findFirst({
      where: { id, sellerId: user.id, status: { not: "REMOVED" } },
    });
    if (!gig) return { error: "Gig not found." };

    const parsed = readGigForm(formData, user.id);
    if (!parsed.success) return { error: firstIssue(parsed.error) };

    // Packages are upserted by tier so open orders keep their packageId;
    // orders already snapshot name, price and delivery.
    const rows = packageRows(parsed.data);
    await db.$transaction([
      db.gig.update({ where: { id: gig.id }, data: gigColumns(parsed.data) }),
      db.gigPackage.deleteMany({
        where: { gigId: gig.id, tier: { notIn: rows.map((r) => r.tier) } },
      }),
      ...rows.map((row) =>
        db.gigPackage.upsert({
          where: { gigId_tier: { gigId: gig.id, tier: row.tier } },
          create: { gigId: gig.id, ...row },
          update: row,
        }),
      ),
    ]);
    revalidateGig(gig.slug, user.username);
    return { success: "Saved." };
  } catch (error) {
    return fieldError(error);
  }
}

/** Pause hides the gig from buyers; remove takes it down for good. Paid orders keep running. */
export async function setGigStatusAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("gigId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["ACTIVE", "PAUSED", "REMOVED"].includes(status)) return;
  const gig = await db.gig.findFirst({ where: { id, sellerId: user.id } });
  if (!gig) return;
  await db.gig.update({
    where: { id: gig.id },
    data: { status: status as "ACTIVE" | "PAUSED" | "REMOVED" },
  });
  revalidateGig(gig.slug, user.username);
}

const briefSchema = z
  .string()
  .trim()
  .min(20, "Tell the seller what you need — at least a sentence.")
  .max(3000);

/**
 * Opens Stripe Checkout for one gig. The charge lands on Godesi's account and
 * the seller's share is transferred on release, so a refund is always possible
 * while the work is open.
 */
export async function buyGigAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let checkoutUrl: string | null = null;
  try {
    const user = await requireUser();
    if (!stripeEnabled()) {
      return { error: "Card payments are not available right now." };
    }
    const slug = String(formData.get("slug") ?? "");
    const tier = String(formData.get("tier") ?? "BASIC");
    const brief = briefSchema.safeParse(formData.get("brief"));
    if (!brief.success) return { error: firstIssue(brief.error) };

    const gig = await db.gig.findFirst({
      where: { slug, status: "ACTIVE" },
      include: {
        seller: { select: { id: true, name: true } },
        packages: true,
      },
    });
    if (!gig) return { error: "This gig is no longer available." };
    if (gig.sellerId === user.id) return { error: "You cannot buy your own gig." };
    const pkg =
      gig.packages.find((p) => p.tier === tier) ??
      gig.packages.find((p) => p.tier === "BASIC") ??
      gig.packages[0];
    if (!pkg) return { error: "This gig has no package to buy yet." };

    const order = await db.gigOrder.create({
      data: {
        gigId: gig.id,
        buyerId: user.id,
        sellerId: gig.sellerId,
        packageId: pkg.id,
        packageName: pkg.name,
        revisions: pkg.revisions,
        deliveryDays: pkg.deliveryDays,
        priceMinor: pkg.priceMinor,
        feeMinor: gigFeeMinor(),
        sellerMinor: sellerShareMinor(pkg.priceMinor),
        currency: "USD",
        brief: brief.data,
      },
    });

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: { kind: "gig", gigOrderId: order.id, userId: user.id },
      payment_intent_data: {
        metadata: { kind: "gig", gigOrderId: order.id },
        description: `Godesi gig: ${gig.title} by ${gig.seller.name}`,
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: pkg.priceMinor,
            product_data: {
              name: `${gig.title} — ${pkg.name}`,
              description: `By ${gig.seller.name} · delivered in ${pkg.deliveryDays} day(s). Held by Godesi until you confirm.`,
            },
          },
        },
      ],
      success_url: `${siteUrl()}/gigs/orders/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}/gigs/${gig.slug}?cancelled=1`,
    });
    if (!session.url) return { error: "Stripe did not return a checkout page." };
    await db.gigOrder.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });
    checkoutUrl = session.url;
  } catch (error) {
    return fieldError(error);
  }
  redirect(checkoutUrl);
}

async function orderForParty(orderId: string, userId: string) {
  return db.gigOrder.findFirst({
    where: { id: orderId, OR: [{ buyerId: userId }, { sellerId: userId }] },
    include: { gig: { select: { title: true, slug: true } } },
  });
}

const messageSchema = z.string().trim().min(1).max(4000);

export async function postGigMessageAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const orderId = String(formData.get("orderId") ?? "");
    const order = await orderForParty(orderId, user.id);
    if (!order) return { error: "Order not found." };
    if (["PENDING", "CANCELLED"].includes(order.status)) {
      return { error: "This order is not open." };
    }
    const body = messageSchema.safeParse(formData.get("body"));
    if (!body.success) return { error: "Write a message first." };

    await db.gigMessage.create({
      data: { orderId: order.id, senderId: user.id, body: body.data },
    });
    const other = user.id === order.buyerId ? order.sellerId : order.buyerId;
    await notify({
      userId: other,
      title: `New message on ${order.gig.title}`,
      body: body.data.slice(0, 120),
      href: `/gigs/orders/${order.id}`,
    });
    revalidatePath(`/gigs/orders/${order.id}`);
    return {};
  } catch (error) {
    return fieldError(error);
  }
}

/** Seller hands over the work; the clock to automatic release starts now. */
export async function deliverGigAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const orderId = String(formData.get("orderId") ?? "");
    const order = await orderForParty(orderId, user.id);
    if (!order || order.sellerId !== user.id) return { error: "Order not found." };
    if (order.status !== "PAID") {
      return { error: "Only an order in progress can be delivered." };
    }
    const body = messageSchema.safeParse(formData.get("body"));
    if (!body.success) {
      return { error: "Describe or link the delivery so the buyer can check it." };
    }

    const now = new Date();
    await db.$transaction([
      db.gigMessage.create({
        data: {
          orderId: order.id,
          senderId: user.id,
          body: body.data,
          delivery: true,
        },
      }),
      db.gigOrder.update({
        where: { id: order.id },
        data: {
          status: "DELIVERED",
          deliveredAt: now,
          autoReleaseAt: autoReleaseDate(now),
        },
      }),
    ]);
    await notify({
      userId: order.buyerId,
      title: `Delivered: ${order.gig.title}`,
      body: "Check the work and confirm, or raise a problem within 7 days.",
      href: `/gigs/orders/${order.id}`,
    });
    revalidatePath(`/gigs/orders/${order.id}`);
    return { success: "Delivered. The buyer has been told." };
  } catch (error) {
    return fieldError(error);
  }
}

/** Buyer is happy: pay the seller now. */
export async function acceptGigAction(formData: FormData) {
  const user = await requireUser();
  const orderId = String(formData.get("orderId") ?? "");
  const order = await orderForParty(orderId, user.id);
  if (!order || order.buyerId !== user.id) return;
  if (order.status !== "DELIVERED") return;
  await releaseGigOrder(order, { resolution: "Buyer confirmed the work." });
  revalidatePath(`/gigs/orders/${order.id}`);
  revalidatePath("/dashboard/gigs");
}

export async function disputeGigAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const orderId = String(formData.get("orderId") ?? "");
    const order = await orderForParty(orderId, user.id);
    if (!order || order.buyerId !== user.id) return { error: "Order not found." };
    if (!["PAID", "DELIVERED"].includes(order.status)) {
      return { error: "This order cannot be disputed." };
    }
    const reason = z
      .string()
      .trim()
      .min(20, "Explain the problem so staff can decide fairly.")
      .max(2000)
      .safeParse(formData.get("reason"));
    if (!reason.success) return { error: firstIssue(reason.error) };

    await db.gigOrder.update({
      where: { id: order.id },
      data: {
        status: "DISPUTED",
        disputedAt: new Date(),
        disputeReason: reason.data,
        autoReleaseAt: null,
      },
    });
    await notify({
      userId: order.sellerId,
      title: `Problem raised on ${order.gig.title}`,
      body: reason.data.slice(0, 120),
      href: `/gigs/orders/${order.id}`,
    });
    revalidatePath(`/gigs/orders/${order.id}`);
    return { success: "Sent to Godesi staff. Payment stays on hold until it is settled." };
  } catch (error) {
    return fieldError(error);
  }
}

/** Seller backs out before starting; buyer is refunded in full. */
export async function declineGigAction(formData: FormData) {
  const user = await requireUser();
  const orderId = String(formData.get("orderId") ?? "");
  const order = await orderForParty(orderId, user.id);
  if (!order || order.sellerId !== user.id || order.status !== "PAID") return;
  await refundGigOrder(order, "Seller declined the order before starting.");
  revalidatePath(`/gigs/orders/${order.id}`);
  revalidatePath("/dashboard/gigs");
}

/** Staff close a dispute one way or the other, with a note both sides can read. */
export async function resolveGigDisputeAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requirePermission("gigs");
    const orderId = String(formData.get("orderId") ?? "");
    const outcome = String(formData.get("outcome") ?? "");
    const note = z
      .string()
      .trim()
      .min(5, "Write a short note for both sides.")
      .max(1000)
      .safeParse(formData.get("note"));
    if (!note.success) return { error: firstIssue(note.error) };

    const order = await db.gigOrder.findUnique({ where: { id: orderId } });
    if (!order) return { error: "Order not found." };
    if (!["DISPUTED", "PAID", "DELIVERED"].includes(order.status)) {
      return { error: "This order is already closed." };
    }

    if (outcome === "release") {
      await releaseGigOrder(order, { resolution: `Staff: ${note.data}` });
    } else if (outcome === "refund") {
      await refundGigOrder(order, `Staff: ${note.data}`);
    } else {
      return { error: "Choose release or refund." };
    }
    const summary = `Godesi staff closed the dispute: ${note.data}`;
    await notify({ userId: order.buyerId, title: "Dispute settled", body: summary, href: `/gigs/orders/${order.id}` });
    await notify({ userId: order.sellerId, title: "Dispute settled", body: summary, href: `/gigs/orders/${order.id}` });
    revalidatePath("/admin/gigs");
    revalidatePath(`/gigs/orders/${order.id}`);
    return { success: `Order ${outcome === "release" ? "released to the seller" : "refunded"} (${usd(order.priceMinor)}).` };
  } catch (error) {
    return fieldError(error);
  }
}

const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z
    .string()
    .trim()
    .min(10, "Say a line about how it went")
    .max(1000),
});

/** Buyer rates a completed order once; the gig's average updates with it. */
export async function reviewGigAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const orderId = String(formData.get("orderId") ?? "");
    const order = await orderForParty(orderId, user.id);
    if (!order || order.buyerId !== user.id) return { error: "Order not found." };
    if (order.status !== "RELEASED") {
      return { error: "You can review once the order is complete." };
    }
    const parsed = reviewSchema.safeParse({
      rating: formData.get("rating"),
      comment: formData.get("comment"),
    });
    if (!parsed.success) return { error: firstIssue(parsed.error) };
    const existing = await db.gigReview.findUnique({ where: { orderId: order.id } });
    if (existing) return { error: "You have already reviewed this order." };

    await db.$transaction([
      db.gigReview.create({
        data: {
          orderId: order.id,
          gigId: order.gigId,
          authorId: user.id,
          rating: parsed.data.rating,
          comment: parsed.data.comment,
        },
      }),
      db.gig.update({
        where: { id: order.gigId },
        data: {
          ratingSum: { increment: parsed.data.rating },
          ratingCount: { increment: 1 },
        },
      }),
    ]);
    await notify({
      userId: order.sellerId,
      title: `${parsed.data.rating}★ review on ${order.gig.title}`,
      body: parsed.data.comment.slice(0, 120),
      href: `/gigs/${order.gig.slug}`,
    });
    revalidatePath(`/gigs/orders/${order.id}`);
    revalidatePath(`/gigs/${order.gig.slug}`);
    revalidatePath("/gigs");
    return { success: "Thanks — your review is on the gig." };
  } catch (error) {
    return fieldError(error);
  }
}

/** Seller answers a review publicly, once. */
export async function replyGigReviewAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const reviewId = String(formData.get("reviewId") ?? "");
    const reply = z.string().trim().min(2).max(600).safeParse(formData.get("reply"));
    if (!reply.success) return { error: "Write a reply first." };
    const review = await db.gigReview.findFirst({
      where: { id: reviewId, gig: { sellerId: user.id }, reply: null },
      include: { gig: { select: { slug: true } } },
    });
    if (!review) return { error: "Review not found." };
    await db.gigReview.update({
      where: { id: review.id },
      data: { reply: reply.data, repliedAt: new Date() },
    });
    revalidatePath(`/gigs/${review.gig.slug}`);
    return { success: "Reply posted." };
  } catch (error) {
    return fieldError(error);
  }
}

/** Marks a released order settled by hand (bank transfer, UPI) when the seller has no Stripe. */
export async function markGigSettledAction(formData: FormData) {
  await requirePermission("gigs");
  const orderId = String(formData.get("orderId") ?? "");
  const reference = String(formData.get("reference") ?? "").trim().slice(0, 120);
  if (!reference) return;
  await db.gigOrder.updateMany({
    where: { id: orderId, status: "RELEASED", stripeTransferId: null },
    data: { stripeTransferId: `manual:${reference}` },
  });
  revalidatePath("/admin/gigs");
}
