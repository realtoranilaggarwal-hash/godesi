"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import {
  adImpressionPrice,
  adPrice,
  durationOrThrow,
  packOrThrow,
  placementOrThrow,
} from "@/lib/ads";
import { requestCurrency } from "@/lib/currency";
import { siteUrl, toMinor } from "@/lib/format";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { wallCreditMinor } from "@/lib/adOrders";
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

const PIXEL_BOARD = 1000; // the wall is 1000 x 1000 pixels = 1,000,000
const PIXEL_PRICE_INR = 85; // ₹85 a pixel ≈ $1
const PIXEL_PRICE_USD = 1; // $1 a pixel
/** Bottom 100 rows of the board are the free zone — book there for $0. */
const WALL_FREE_Y = 900;
/** Free bookings (free zone or promo code) are one brick: 4 px, worth $4. */
const WALL_FREE_MAX_PX = 4;
/** Promo code that makes any wall block free while the wall launches. */
const WALL_FREE_CODE = "godesi.com";

const pixelSchema = z.object({
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  w: z.number().int().min(2),
  h: z.number().int().min(2),
  title: z.string().trim().min(2, "Give your block a title").max(80),
  linkUrl: z.string().trim().url("Enter a valid destination URL"),
  imageUrl: z.string().trim().url("Enter a valid image URL").or(z.literal("")),
  code: z.string().trim().max(40).optional(),
});

export type WallCheckoutResult = { error?: string };

/**
 * Million-pixel wall checkout: the vendor dragged a rectangle on the board —
 * price is $1 per pixel (min 4px = $4). One WallBlock + one AdOrder, then
 * Stripe; confirmAdOrder lights the block up once payment lands.
 */
export async function startPixelWallCheckoutAction(
  input: unknown,
): Promise<WallCheckoutResult> {
  const user = await requireUser();

  const parsed = pixelSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { x, y, w, h, title, linkUrl } = parsed.data;
  const imageUrl = parsed.data.imageUrl || PLACEHOLDER_CREATIVE;
  const pixels = w * h;

  if (x + w > PIXEL_BOARD || y + h > PIXEL_BOARD || pixels < 4) {
    return { error: "That spot doesn't fit on the board — drag a rectangle inside it." };
  }

  const inFreeZone = y >= WALL_FREE_Y;
  const codeFree =
    (parsed.data.code ?? "").toLowerCase() === WALL_FREE_CODE;
  // Free zone grants a single 4px brick; the promo code frees any block.
  const wantsFree = (inFreeZone && pixels <= WALL_FREE_MAX_PX) || codeFree;

  // A free claim is only free while the member hasn't used their one free
  // brick — after that (or past the one-brick cap) the same spot is paid.
  let free = false;
  if (wantsFree) {
    const alreadyFree = await db.adOrder.findFirst({
      where: { userId: user.id, wallBlockId: { not: null }, provider: "free" },
      select: { id: true },
    });
    free = !alreadyFree;
  }

  const existing = await db.wallBlock.findMany({
    where: { status: { in: ["DRAFT", "PENDING", "ACTIVE"] } },
    select: { x: true, y: true, w: true, h: true },
  });
  const clash = existing.some(
    (block) =>
      block.x < x + w && block.x + block.w > x && block.y < y + h && block.y + block.h > y,
  );
  if (clash) {
    return { error: "Part of that spot is already taken — drag somewhere free." };
  }

  if (free) {
    try {
      const block = await db.wallBlock.create({
        data: {
          x, y, w, h,
          title,
          imageUrl,
          linkUrl,
          // Free bricks wait for review so the public wall can't be
          // vandalised with a $0 claim.
          status: "PENDING",
          advertiserId: user.id,
        },
      });
      await db.adOrder.create({
        data: {
          userId: user.id,
          wallBlockId: block.id,
          slot: "WALL",
          pricing: "MONTHLY",
          months: 1,
          amountMinor: 0,
          currency: requestCurrency(),
          provider: "free",
          status: "PAID",
        },
      });
    } catch {
      // unique index on one free order per user — a second simultaneous
      // free claim lands here.
      return { error: "You've already claimed a free block — the next one is paid." };
    }
    revalidateTag("wall-blocks");
    revalidatePath("/walloffame");
    redirect("/walloffame?free=1");
  }

  const currency = requestCurrency();
  const pxPrice = currency === "INR" ? PIXEL_PRICE_INR : PIXEL_PRICE_USD;
  const chargeMinor = toMinor(pixels * pxPrice);

  // Dollars already spent on other ads (featured spots, side banners) turn
  // into wall credit — every dollar buys the same in bricks.
  const creditMinor = await wallCreditMinor(user.id, currency);
  const creditApplied = Math.min(creditMinor, chargeMinor);
  const payMinor = chargeMinor - creditApplied;

  if (payMinor > 0 && !stripeEnabled()) return { error: "stripe_unavailable" };

  const block = await db.wallBlock.create({
    data: {
      x, y, w, h,
      title,
      imageUrl,
      linkUrl,
      status: payMinor === 0 ? "ACTIVE" : "DRAFT",
      advertiserId: user.id,
    },
  });

  const order = await db.adOrder.create({
    data: {
      userId: user.id,
      wallBlockId: block.id,
      slot: "WALL",
      pricing: "MONTHLY",
      months: 1,
      amountMinor: payMinor,
      wallCreditMinor: creditApplied,
      currency,
      provider: payMinor === 0 ? "wall-credit" : "stripe",
      ...(payMinor === 0 ? { status: "PAID" } : {}),
    },
  });

  if (payMinor === 0) {
    revalidateTag("wall-blocks");
    revalidatePath("/walloffame");
    redirect("/walloffame?paid=1");
  }

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    client_reference_id: user.id,
    metadata: { kind: "ad", adOrderId: order.id, userId: user.id },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: payMinor,
          product_data: {
            name: `GoDesi Wall of Fame — ${pixels.toLocaleString()} pixels`,
            description: `${w}×${h}px block at (${x}, ${y}) — permanent spot on godesi.com/walloffame`,
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
