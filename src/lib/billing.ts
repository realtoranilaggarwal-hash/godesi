import type { Plan } from "@prisma/client";
import { db } from "@/lib/db";
import { PLANS } from "@/lib/plans";

export const PLAN_DURATION_DAYS = 30;

export type PaymentProvider = "stripe" | "paypal" | "mock";

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
  amount,
  currency,
}: {
  userId: string;
  plan: Plan;
  provider: PaymentProvider;
  reference: string;
  amount: number;
  currency: string;
}) {
  const existing = await db.payment.findUnique({ where: { reference } });
  if (existing) return { alreadyProcessed: true as const, payment: existing };

  const expiresAt = new Date(Date.now() + PLAN_DURATION_DAYS * 24 * 60 * 60 * 1000);

  const [payment] = await db.$transaction([
    db.payment.create({
      data: { userId, plan, amount, currency, provider, reference },
    }),
    db.user.update({
      where: { id: userId },
      data: { plan, planExpiresAt: expiresAt },
    }),
    db.business.updateMany({ where: { ownerId: userId }, data: { featured: true } }),
  ]);

  return { alreadyProcessed: false as const, payment };
}

export async function downgradeToFree(userId: string) {
  await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: { plan: "FREE", planExpiresAt: null },
    }),
    db.business.updateMany({ where: { ownerId: userId }, data: { featured: false } }),
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
