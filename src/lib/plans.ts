import type { Plan, User } from "@prisma/client";

export type PlanInfo = {
  id: Plan;
  name: string;
  priceInr: number;
  /** PayPal cannot settle INR, so paid plans are also priced in USD. */
  priceUsd: number;
  mediaLimit: number;
  features: string[];
};

export const PLANS: Record<Plan, PlanInfo> = {
  FREE: {
    id: "FREE",
    name: "Free",
    priceInr: 0,
    priceUsd: 0,
    mediaLimit: 5,
    features: [
      "Digital business card profile",
      "Unique QR code + download",
      "WhatsApp click-to-chat button",
      "Up to 5 uploaded images",
    ],
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    priceInr: 499,
    priceUsd: 5.99,
    mediaLimit: 20,
    features: [
      "Everything in Free",
      "Featured listing badge",
      "Up to 20 uploaded images",
      "Phone and email shown on your listing",
      "List under 2 extra categories",
      "Higher search ranking than Free",
    ],
  },
  PREMIUM: {
    id: "PREMIUM",
    name: "Premium",
    priceInr: 999,
    priceUsd: 11.99,
    mediaLimit: 20,
    features: [
      "Everything in Pro",
      "Unlock lead contact details",
      "List under 5 extra categories",
      "Analytics dashboard",
      "Priority ranking in search",
      "Up to 20 uploaded images",
    ],
  },
};

export const PLAN_ORDER: Plan[] = ["FREE", "PRO", "PREMIUM"];

export function planRank(plan: Plan) {
  return PLAN_ORDER.indexOf(plan);
}

export function isPlanActive(user: Pick<User, "plan" | "planExpiresAt">) {
  if (user.plan === "FREE") return true;
  if (!user.planExpiresAt) return false;
  return user.planExpiresAt.getTime() > Date.now();
}

export function effectivePlan(user: Pick<User, "plan" | "planExpiresAt">): Plan {
  return isPlanActive(user) ? user.plan : "FREE";
}

export function canUnlockLeads(user: Pick<User, "plan" | "planExpiresAt">) {
  return effectivePlan(user) === "PREMIUM";
}

export function mediaLimit(user: Pick<User, "plan" | "planExpiresAt">) {
  return PLANS[effectivePlan(user)].mediaLimit;
}

/**
 * Extra categories a card may appear under beyond its primary one. Paid perk, and
 * founding members keep it for free as part of their seat.
 */
export function extraCategoryLimit(
  user: Pick<User, "plan" | "planExpiresAt" | "foundingNumber">,
) {
  if (user.foundingNumber !== null) return EXTRA_CATEGORY_LIMITS.PREMIUM;
  return EXTRA_CATEGORY_LIMITS[effectivePlan(user)];
}

const EXTRA_CATEGORY_LIMITS: Record<Plan, number> = {
  FREE: 0,
  PRO: 2,
  PREMIUM: 5,
};
