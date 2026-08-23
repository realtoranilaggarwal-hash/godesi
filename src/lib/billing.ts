import type { Plan } from "@prisma/client";
import { db } from "@/lib/db";
import { PLANS } from "@/lib/plans";
import { notify } from "@/lib/notifications";
import { awardPoints, awardSpendPoints } from "@/lib/rewardsQueries";
import { cartItem, type CartItem } from "@/lib/bundles";

/** Banners inside a package are still booked a year at a time. */
export const BANNER_MONTHS = 12;

/** The longest term on sale is the five-year founding one, plus coupon bonus months. */
const MAX_TERM_MONTHS = 72;

/**
 * Membership runs to the same day of the month it was bought on, so a year is a
 * real year rather than twelve thirty-day blocks.
 */
export function termEnd(months: number) {
  const end = new Date();
  end.setMonth(end.getMonth() + termMonths(months));
  return end;
}

/** Guards against a bad provider callback buying a century of membership. */
export function termMonths(months: number) {
  if (!Number.isFinite(months)) return 1;
  return Math.min(MAX_TERM_MONTHS, Math.max(1, Math.round(months)));
}

export type PaymentProvider = "stripe" | "paypal" | "upi" | "mock";

/**
 * Activates a paid plan for a user and records the payment.
 * Idempotent on `reference` (the provider's payment id), so a webhook and a
 * redirect callback can both call this without double-charging the entitlement.
 */
export async function activatePlan({
  userId,
  plan,
  provider,
  reference,
  amountMinor,
  currency,
  months = 1,
}: {
  userId: string;
  plan: Plan;
  provider: PaymentProvider;
  reference: string;
  /** In the currency's minor unit (paise, cents). */
  amountMinor: number;
  currency: string;
  /** Months of membership bought — the yearly package sells 12 or more. */
  months?: number;
}) {
  const existing = await db.payment.findUnique({ where: { reference } });
  if (existing) return { alreadyProcessed: true as const, payment: existing };

  const expiresAt = termEnd(months);

  const [payment] = await db.$transaction([
    db.payment.create({
      data: { userId, plan, amountMinor, currency, provider, reference },
    }),
    db.user.update({
      where: { id: userId },
      data: { plan, planExpiresAt: expiresAt },
    }),
    db.business.updateMany({
      where: { ownerId: userId },
      data: {
        featured: true,
        featuredRank: plan === "PREMIUM" ? 2 : 1,
        featuredUntil: expiresAt,
      },
    }),
  ]);

  await awardPoints({
    userId,
    reason: "PAID_UPGRADE",
    note: `${plan} membership`,
  });
  await awardSpendPoints({
    userId,
    amountMinor,
    currency,
    note: `${plan} membership`,
    reference,
  });

  const referrer = await db.user.findUnique({
    where: { id: userId },
    select: { referredById: true },
  });
  if (referrer?.referredById) {
    await awardPoints({
      userId: referrer.referredById,
      reason: "PAID_UPGRADE",
      note: "A member you referred upgraded",
    });
  }

  return { alreadyProcessed: false as const, payment };
}

/**
 * Grants a paid cart: the membership for the whole term, plus an ad order for
 * every banner bought so the desk knows to place the creative.
 */
export async function grantBundle({
  userId,
  months,
  itemKeys,
  provider,
  reference,
  amountMinor,
  currency,
}: {
  userId: string;
  months: number;
  itemKeys: string[];
  provider: PaymentProvider;
  reference: string;
  amountMinor: number;
  currency: string;
}) {
  const items = itemKeys
    .map((key) => cartItem(key))
    .filter((item): item is CartItem => Boolean(item));

  const result = await activatePlan({
    userId,
    plan: "PREMIUM",
    provider,
    reference,
    amountMinor,
    currency,
    months,
  });
  if (result.alreadyProcessed) return result;

  if (items.some((item) => item.key === "elite")) {
    await grantEliteInterview(userId, months);
  }

  for (const item of items) {
    if (!item.slot) continue;
    await db.adOrder.create({
      data: {
        userId,
        slot: item.slot,
        months: BANNER_MONTHS,
        amountMinor: 0,
        currency,
        provider,
        reference: `bundle_${item.key}_${reference}`,
        status: "PAID",
      },
    });
  }

  return result;
}

/**
 * An Elite interview bought inside a package: credited to the application if
 * they already have one, otherwise held on the account until they apply.
 */
async function grantEliteInterview(userId: string, months: number) {
  const entry = await db.eliteEntry.findFirst({
    where: { userId },
    select: { id: true },
  });

  if (entry) {
    await db.eliteEntry.update({
      where: { id: entry.id },
      data: { interviewPaid: true, eliteUntil: termEnd(months) },
    });
  } else {
    await db.user.update({
      where: { id: userId },
      data: { elitePrepaid: true },
    });
  }

  await notify({
    userId,
    title: "GoDesi Elite interview is paid",
    body: entry
      ? "Your Elite application is marked interview-paid — our team will contact you to book it."
      : "Complete your Elite application and the interview is already paid for.",
    href: "/desi-elite/apply",
  });
}

export async function downgradeToFree(userId: string) {
  await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: { plan: "FREE", planExpiresAt: null },
    }),
    db.business.updateMany({
      where: { ownerId: userId },
      data: { featured: false, featuredRank: 0, featuredUntil: null },
    }),
  ]);
}

export function assertPaidPlan(planId: string): Plan {
  if (planId !== "PRO" && planId !== "PREMIUM") {
    throw new Error("Only the Pro and Premium plans can be purchased.");
  }
  return planId;
}

/** A plan posted by a form, or nothing, so the caller can send them back. */
export function planOrNull(planId: string) {
  return planId === "PRO" || planId === "PREMIUM" ? PLANS[planId] : null;
}

export function planOrThrow(planId: string) {
  const plan = PLANS[assertPaidPlan(planId)];
  if (!plan) throw new Error("Unknown plan");
  return plan;
}
