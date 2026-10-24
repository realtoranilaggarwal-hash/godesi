"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import {
  AD_PLACEMENTS,
  adImpressionPrice,
  adPrice,
  durationOrThrow,
  packOrThrow,
  placementOrThrow,
} from "@/lib/ads";
import { requestCurrency } from "@/lib/currency";
import { siteUrl, toMinor } from "@/lib/format";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { checkCoupon, couponMetadata } from "@/lib/coupons";

const PLACEHOLDER_CREATIVE =
  "https://placehold.co/300x250/6366f1/ffffff?text=Your+banner+here";

/**
 * Books a placement: creates the advertiser's draft banner plus a pending order,
 * then hands off to Stripe. The banner only goes live once payment is confirmed
 * and an admin approves the creative.
 */
export async function startAdCheckoutAction(formData: FormData) {
  const user = await requireUser();
  const placement = placementOrThrow(String(formData.get("slot") ?? ""));
  const currency = requestCurrency();

  const byImpressions = String(formData.get("pricing") ?? "MONTHLY") === "IMPRESSIONS";
  const months = byImpressions ? 1 : durationOrThrow(String(formData.get("months") ?? ""));
  const impressions = byImpressions
    ? packOrThrow(String(formData.get("impressions") ?? ""))
    : null;
  const amount = impressions
    ? adImpressionPrice(placement, currency, impressions)
    : adPrice(placement, currency, months);

  if (!stripeEnabled()) redirect("/advertise?error=stripe_unavailable");

  const code = String(formData.get("couponCode") ?? "").trim();
  const check = code
    ? await checkCoupon({
        code,
        scope: "ADS",
        userId: user.id,
        subtotalMinor: toMinor(amount),
        currency,
      })
    : null;
  if (check && !check.ok) redirect("/advertise?error=coupon");

  const discountMinor = check?.ok ? check.discountMinor : 0;
  const chargeMinor = Math.max(0, toMinor(amount) - discountMinor);

  const banner = await db.banner.create({
    data: {
      slot: placement.slot,
      title: `${user.name} — ${placement.name}`,
      imageUrl: PLACEHOLDER_CREATIVE,
      linkUrl: siteUrl(),
      status: "DRAFT",
      active: false,
      advertiserId: user.id,
    },
  });

  const order = await db.adOrder.create({
    data: {
      userId: user.id,
      bannerId: banner.id,
      slot: placement.slot,
      pricing: impressions ? "IMPRESSIONS" : "MONTHLY",
      months,
      impressions,
      amountMinor: chargeMinor,
      currency,
    },
  });

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    client_reference_id: user.id,
    metadata: {
      kind: "ad",
      adOrderId: order.id,
      bannerId: banner.id,
      userId: user.id,
      ...couponMetadata(check?.ok ? check.coupon : null, discountMinor),
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: chargeMinor,
          product_data: {
            name: impressions
              ? `Godesi ${placement.name} — ${impressions.toLocaleString()} views`
              : `Godesi ${placement.name} — ${months} month${months > 1 ? "s" : ""}`,
            description: `${placement.size.width}x${placement.size.height} banner placement`,
          },
        },
      },
    ],
    success_url: `${siteUrl()}/dashboard/ads?paid={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/advertise?error=cancelled`,
  });

  if (!session.url) redirect("/advertise?error=stripe_session");
  redirect(session.url);
}

const WALL_BRICKS = AD_PLACEMENTS.WALL.slots;

const wallSchema = z.object({
  cells: z
    .array(z.number().int().min(1).max(WALL_BRICKS))
    .min(1, "Pick at least one brick")
    .max(WALL_BRICKS)
    .transform((cells) => Array.from(new Set(cells))),
  title: z.string().trim().min(2, "Give your wall tile a title").max(80),
  linkUrl: z.string().trim().url("Enter a valid destination URL"),
  imageUrl: z.string().trim().url("Enter a valid image URL").or(z.literal("")),
});

export type WallCheckoutResult = { error?: string };

/**
 * Wall-of-Fame booking: one Stripe checkout buys every brick the vendor dragged
 * over — a draft banner per brick under a single order. Paid bricks turn
 * PENDING in confirmAdOrder and go live on admin approval.
 */
export async function startWallCheckoutAction(
  input: unknown,
): Promise<WallCheckoutResult> {
  const user = await requireUser();

  const parsed = wallSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { cells, title, linkUrl } = parsed.data;
  const imageUrl = parsed.data.imageUrl || PLACEHOLDER_CREATIVE;

  if (!stripeEnabled()) return { error: "stripe_unavailable" };

  const taken = await db.banner.findMany({
    where: {
      slot: "WALL",
      position: { in: cells },
      status: { in: ["DRAFT", "PENDING", "ACTIVE"] },
    },
    select: { position: true },
  });
  if (taken.length) {
    return {
      error: `Brick${taken.length > 1 ? "s" : ""} ${taken
        .map((brick) => brick.position)
        .sort((a, b) => (a ?? 0) - (b ?? 0))
        .slice(0, 8)
        .join(", ")} just got booked — pick different ones.`,
    };
  }

  const currency = requestCurrency();
  const unit =
    currency === "INR" ? AD_PLACEMENTS.WALL.priceInr : AD_PLACEMENTS.WALL.priceUsd;
  const chargeMinor = toMinor(unit * cells.length);

  let banners;
  try {
    banners = await Promise.all(
      cells.map((position) =>
        db.banner.create({
          data: {
            slot: "WALL",
            position,
            title,
            imageUrl,
            linkUrl,
            status: "DRAFT",
            active: false,
            advertiserId: user.id,
          },
        }),
      ),
    );
  } catch {
    return { error: "One of those bricks just got booked — pick different ones." };
  }

  const order = await db.adOrder.create({
    data: {
      userId: user.id,
      bannerId: banners[0].id,
      bannerIds: banners.map((banner) => banner.id),
      slot: "WALL",
      pricing: "MONTHLY",
      months: 1,
      amountMinor: chargeMinor,
      currency,
    },
  });

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    client_reference_id: user.id,
    metadata: {
      kind: "ad",
      adOrderId: order.id,
      bannerId: banners[0].id,
      userId: user.id,
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: chargeMinor,
          product_data: {
            name: `GoDesi Wall of Fame — ${cells.length} brick${cells.length > 1 ? "s" : ""}`,
            description: `Brick${cells.length > 1 ? "s" : ""} ${cells
              .slice(0, 12)
              .join(", ")}${cells.length > 12 ? "…" : ""} — permanent spot on godesi.com/walloffame`,
          },
        },
      },
    ],
    success_url: `${siteUrl()}/walloffame?paid=1`,
    cancel_url: `${siteUrl()}/walloffame?error=cancelled`,
  });

  if (!session.url) return { error: "stripe_session" };
  redirect(session.url);
}

const creativeSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(2, "Give your ad a title"),
  imageUrl: z.string().trim().url("Enter a valid image URL"),
  linkUrl: z.string().trim().url("Enter a valid destination URL"),
});

/** Advertisers can swap their own creative; edits go back for admin review. */
export async function saveAdCreativeAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = creativeSchema.safeParse({
      id: formData.get("id"),
      title: formData.get("title"),
      imageUrl: formData.get("imageUrl"),
      linkUrl: formData.get("linkUrl"),
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const banner = await db.banner.findUnique({ where: { id: parsed.data.id } });
    if (!banner || banner.advertiserId !== user.id) {
      return { error: "You do not have access to this banner." };
    }

    const paid = await db.adOrder.findFirst({
      where: { bannerId: banner.id, status: "PAID" },
    });

    await db.banner.update({
      where: { id: banner.id },
      data: {
        title: parsed.data.title,
        imageUrl: parsed.data.imageUrl,
        linkUrl: parsed.data.linkUrl,
        status: paid || banner.status === "ACTIVE" ? "PENDING" : "DRAFT",
      },
    });

    revalidatePath("/dashboard/ads");
    revalidatePath("/admin");
    return {
      success: paid || banner.status === "ACTIVE"
        ? "Creative saved — it goes live once an admin approves it."
        : "Creative saved. Complete payment to book the slot.",
    };
  } catch (error) {
    return fieldError(error);
  }
}
