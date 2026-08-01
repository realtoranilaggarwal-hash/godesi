import type { Plan } from "@prisma/client";
import { db } from "@/lib/db";
import { PLANS } from "@/lib/plans";
import { awardPoints, awardSpendPoints } from "@/lib/rewards";
import { cartItem, type CartItem } from "@/lib/bundles";

export const PLAN_DURATION_DAYS = 30;

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

  const expiresAt = new Date(
    Date.now() + months * PLAN_DURATION_DAYS * 24 * 60 * 60 * 1000,
  );

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
      data: { featured: true },
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

  for (const item of items) {
    if (!item.slot) continue;
    await db.adOrder.create({
      data: {
        userId,
        slot: item.slot,
        months,
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

export async function downgradeToFree(userId: string) {
  await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: { plan: "FREE", planExpiresAt: null },
    }),
    db.business.updateMany({
      where: { ownerId: userId },
      data: { featured: false },
    }),
  ]);
}

export function assertPaidPlan(planId: string): Plan {
  if (planId !== "PRO" && planId !== "PREMIUM") {
    throw new Error("Only the Pro and Premium plans can be purchased.");
  }
  return planId;
}

export function planOrThrow(planId: string) {
  const plan = PLANS[assertPaidPlan(planId)];
  if (!plan) throw new Error("Unknown plan");
  return plan;
}
