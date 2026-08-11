"use server";

import { revalidatePath } from "next/cache";
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
        status: paid ? "PENDING" : "DRAFT",
      },
    });

    revalidatePath("/dashboard/ads");
    revalidatePath("/admin");
    return {
      success: paid
        ? "Creative saved — it goes live once an admin approves it."
        : "Creative saved. Complete payment to book the slot.",
    };
  } catch (error) {
    return fieldError(error);
  }
}
