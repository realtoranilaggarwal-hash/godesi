import type { Coupon, CouponScope } from "@prisma/client";
import { db } from "@/lib/db";
import { toMinor } from "@/lib/format";

export function normalizeCouponCode(input: string) {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}

export function describeCoupon(coupon: Coupon) {
  const money =
    coupon.amount > 0
      ? coupon.discountKind === "PERCENT"
        ? `${coupon.amount}% off`
        : `${coupon.currency ?? ""} ${coupon.amount} off`.trim()
      : null;
  const bonus = coupon.bonusMonths
    ? `+${coupon.bonusMonths} months free`
    : null;
  return [money, bonus].filter(Boolean).join(" · ") || "no discount";
}

/** Discount in minor units, never more than the amount being charged. */
export function discountFor({
  coupon,
  subtotalMinor,
  currency,
}: {
  coupon: Coupon;
  subtotalMinor: number;
  currency: string;
}) {
  if (coupon.discountKind === "PERCENT") {
    return Math.min(
      subtotalMinor,
      Math.round((subtotalMinor * coupon.amount) / 100),
    );
  }
  if ((coupon.currency ?? "").toUpperCase() !== currency.toUpperCase())
    return 0;
  return Math.min(subtotalMinor, toMinor(coupon.amount));
}

export type CouponCheck =
  | { ok: true; coupon: Coupon; discountMinor: number }
  | { ok: false; error: string };

/**
 * Validates a code for one checkout: scope, event, expiry, usage caps and the
 * one-per-member rule. Returns the discount so callers can price the checkout.
 */
export async function checkCoupon({
  code,
  scope,
  userId,
  eventId,
  subtotalMinor,
  currency,
  requireDiscount = true,
}: {
  code: string;
  scope: CouponScope;
  userId: string;
  eventId?: string;
  subtotalMinor: number;
  currency: string;
  /** Bundle codes may give extra months instead of money off. */
  requireDiscount?: boolean;
}): Promise<CouponCheck> {
  const normalized = normalizeCouponCode(code);
  if (!normalized) return { ok: false, error: "Enter a coupon code." };

  const coupon = await db.coupon.findUnique({ where: { code: normalized } });
  if (!coupon || !coupon.active)
    return { ok: false, error: "That coupon code is not valid." };
  if (coupon.scope !== scope) {
    return { ok: false, error: "That coupon cannot be used on this purchase." };
  }
  if (coupon.eventId && coupon.eventId !== eventId) {
    return { ok: false, error: "That coupon belongs to a different event." };
  }
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
    return { ok: false, error: "That coupon has expired." };
  }
  if (
    coupon.maxRedemptions !== null &&
    coupon.timesRedeemed >= coupon.maxRedemptions
  ) {
    return { ok: false, error: "That coupon has been fully used." };
  }

  const used = await db.couponRedemption.findUnique({
    where: { couponId_userId: { couponId: coupon.id, userId } },
  });
  if (used) return { ok: false, error: "You have already used that coupon." };

  const discountMinor = discountFor({ coupon, subtotalMinor, currency });
  if (discountMinor <= 0 && requireDiscount) {
    return { ok: false, error: "That coupon does not apply to this amount." };
  }

  return { ok: true, coupon, discountMinor };
}

/** Stripe metadata we round-trip so a coupon is only counted on real payment. */
export function couponMetadata(
  coupon: { id: string } | null,
  discountMinor: number,
): Record<string, string> {
  if (!coupon) return {};
  return { couponId: coupon.id, couponDiscountMinor: String(discountMinor) };
}

/**
 * Counts a discount carried on a completed Stripe session. Safe to call from
 * both the webhook and the success page.
 */
export async function recordCouponFromMetadata({
  metadata,
  userId,
  currency,
  reference,
}: {
  metadata: Record<string, string> | null | undefined;
  userId: string;
  currency: string;
  reference: string;
}) {
  const couponId = metadata?.couponId;
  const discountMinor = Number(metadata?.couponDiscountMinor ?? 0);
  if (!couponId || !Number.isFinite(discountMinor) || discountMinor < 0) return;
  await recordCouponUse({
    couponId,
    userId,
    amountMinor: discountMinor,
    currency,
    reference,
  });
}

/**
 * Records a use. Unique on `reference` and on (coupon, user), so a retried
 * checkout or a webhook replay cannot count the same discount twice.
 */
export async function recordCouponUse({
  couponId,
  userId,
  amountMinor,
  currency,
  reference,
}: {
  couponId: string;
  userId: string;
  amountMinor: number;
  currency: string;
  reference: string;
}) {
  try {
    await db.$transaction([
      db.couponRedemption.create({
        data: { couponId, userId, amountMinor, currency, reference },
      }),
      db.coupon.update({
        where: { id: couponId },
        data: { timesRedeemed: { increment: 1 } },
      }),
    ]);
  } catch {
    // Already recorded — the unique constraints are the guard, not an error path.
  }
}
