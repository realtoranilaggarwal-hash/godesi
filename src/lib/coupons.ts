import type { Coupon, CouponScope, Plan, User } from "@prisma/client";
import { db } from "@/lib/db";
import { toMinor } from "@/lib/format";
import { effectivePlan, type TermId } from "@/lib/plans";

/** Comp tickets and ticket-type limits on organiser codes are a Premium tool (admins always). */
export function hasPremiumCoupons(
  user: Pick<User, "role" | "plan" | "planExpiresAt">,
) {
  return user.role === "ADMIN" || effectivePlan(user) === "PREMIUM";
}

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
  const limits = couponTierLimits(coupon);
  const covers = limits.length ? `covers ${describeTierLimits(limits)}` : null;
  return [money, bonus, covers].filter(Boolean).join(" · ") || "no discount";
}

export type CouponTierLimit = {
  tierId: string;
  name: string;
  maxQuantity: number;
};

export function couponTierLimits(
  coupon: Pick<Coupon, "tierLimits">,
): CouponTierLimit[] {
  if (!Array.isArray(coupon.tierLimits)) return [];
  return coupon.tierLimits.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const { tierId, name, maxQuantity } = item as Record<string, unknown>;
    if (typeof tierId !== "string" || typeof maxQuantity !== "number") return [];
    if (!Number.isInteger(maxQuantity) || maxQuantity < 1) return [];
    return [{ tierId, name: typeof name === "string" ? name : "", maxQuantity }];
  });
}

export function describeTierLimits(limits: CouponTierLimit[]) {
  return limits
    .map((limit) => `${limit.name || "ticket"} ×${limit.maxQuantity}`)
    .join(" + ");
}

/** Reads the optional `tierMax_<tierId>` boxes of a coupon form (1–10 each, blank = not covered). */
export function parseTierLimits(
  formData: FormData,
  tiers: { id: string; name: string }[],
): { limits: CouponTierLimit[] } | { error: string } {
  const limits: CouponTierLimit[] = [];
  for (const tier of tiers) {
    const raw = String(formData.get(`tierMax_${tier.id}`) ?? "").trim();
    if (!raw) continue;
    const maxQuantity = Number(raw);
    if (!Number.isInteger(maxQuantity) || maxQuantity < 1 || maxQuantity > 10) {
      return { error: `Enter 1–10 for ${tier.name}, or leave it blank.` };
    }
    limits.push({ tierId: tier.id, name: tier.name, maxQuantity });
  }
  return { limits };
}

export type CouponTicketLine = {
  tierId: string | null;
  quantity: number;
  unitMinor: number;
};

/**
 * How much of each booking line a code may discount: the whole line, or for a
 * tier-limited percent code only its listed ticket types up to their max
 * quantity. Fixed-amount codes always come off the whole order.
 */
export function couponEligibleMinor(
  coupon: Pick<Coupon, "tierLimits" | "discountKind">,
  lines: CouponTicketLine[],
) {
  const limits = couponTierLimits(coupon);
  return lines.map((line) => {
    if (!limits.length || coupon.discountKind === "FIXED")
      return line.quantity * line.unitMinor;
    const limit = limits.find((item) => item.tierId === line.tierId);
    return limit
      ? Math.min(line.quantity, limit.maxQuantity) * line.unitMinor
      : 0;
  });
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

/** Five-year Featured also takes the package codes, so HALF5 halves it. */
export function planCouponScopes(plan: Plan, term: TermId): CouponScope[] {
  return plan === "PREMIUM" && term === "FIVE_YEAR"
    ? ["PLAN", "BUNDLE"]
    : ["PLAN"];
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
  ticketLines,
}: {
  code: string;
  scope: CouponScope | CouponScope[];
  userId: string;
  eventId?: string;
  subtotalMinor: number;
  currency: string;
  /** Bundle codes may give extra months instead of money off. */
  requireDiscount?: boolean;
  /** Ticket checkout lines, so tier-limited codes only discount the tickets they cover. */
  ticketLines?: CouponTicketLine[];
}): Promise<CouponCheck> {
  const normalized = normalizeCouponCode(code);
  if (!normalized) return { ok: false, error: "Enter a coupon code." };

  const coupon = await db.coupon.findUnique({ where: { code: normalized } });
  if (!coupon || !coupon.active)
    return { ok: false, error: "That coupon code is not valid." };
  if (!(Array.isArray(scope) ? scope : [scope]).includes(coupon.scope)) {
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

  let eligibleMinor = subtotalMinor;
  const limits = couponTierLimits(coupon);
  if (limits.length) {
    const covered = (ticketLines ?? []).filter(
      (line) =>
        line.quantity > 0 &&
        limits.some((limit) => limit.tierId === line.tierId),
    );
    if (!covered.length) {
      return {
        ok: false,
        error: `That coupon only covers ${describeTierLimits(limits)} tickets.`,
      };
    }
    eligibleMinor = couponEligibleMinor(coupon, ticketLines ?? []).reduce(
      (sum, value) => sum + value,
      0,
    );
  }

  const discountMinor = discountFor({
    coupon,
    subtotalMinor: Math.min(eligibleMinor, subtotalMinor),
    currency,
  });
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
