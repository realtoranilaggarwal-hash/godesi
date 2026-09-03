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
  autoReleaseDate,
  gigFeeMinor,
  refundGigOrder,
  releaseGigOrder,
  sellerShareMinor,
  uniqueGigSlug,
  usd,
} from "@/lib/gigs";

const gigSchema = z.object({
  title: z.string().trim().min(6, "Give the gig a clear title").max(80),
  description: z
    .string()
    .trim()
    .min(40, "Say what you will do in at least a couple of sentences")
    .max(2000),
  includes: z.string().trim().max(1000).optional(),
  priceUsd: z.coerce
    .number()
    .int("Whole dollars only")
    .min(GIG_MIN_USD, `Gigs start at $${GIG_MIN_USD}`)
    .max(GIG_MAX_USD, `Gigs are capped at $${GIG_MAX_USD}`),
  deliveryDays: z.coerce.number().int().min(1).max(MAX_DELIVERY_DAYS),
});

function firstIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Please check the form.";
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
    const parsed = gigSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      includes: formData.get("includes") ?? undefined,
      priceUsd: formData.get("priceUsd"),
      deliveryDays: formData.get("deliveryDays"),
    });
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
        title: sentenceCase(parsed.data.title),
        description: parsed.data.description,
        includes: parsed.data.includes || null,
        priceMinor: parsed.data.priceUsd * 100,
        deliveryDays: parsed.data.deliveryDays,
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

    const parsed = gigSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      includes: formData.get("includes") ?? undefined,
      priceUsd: formData.get("priceUsd"),
      deliveryDays: formData.get("deliveryDays"),
    });
    if (!parsed.success) return { error: firstIssue(parsed.error) };

    await db.gig.update({
      where: { id: gig.id },
      data: {
        title: sentenceCase(parsed.data.title),
        description: parsed.data.description,
        includes: parsed.data.includes || null,
        priceMinor: parsed.data.priceUsd * 100,
        deliveryDays: parsed.data.deliveryDays,
      },
    });
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
    const brief = briefSchema.safeParse(formData.get("brief"));
    if (!brief.success) return { error: firstIssue(brief.error) };

    const gig = await db.gig.findFirst({
      where: { slug, status: "ACTIVE" },
      include: { seller: { select: { id: true, name: true } } },
    });
    if (!gig) return { error: "This gig is no longer available." };
    if (gig.sellerId === user.id) return { error: "You cannot buy your own gig." };

    const order = await db.gigOrder.create({
      data: {
        gigId: gig.id,
        buyerId: user.id,
        sellerId: gig.sellerId,
        priceMinor: gig.priceMinor,
        feeMinor: gigFeeMinor(),
        sellerMinor: sellerShareMinor(gig.priceMinor),
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
            unit_amount: gig.priceMinor,
            product_data: {
              name: gig.title,
              description: `By ${gig.seller.name} · delivered in ${gig.deliveryDays} day(s). Held by Godesi until you confirm.`,
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
