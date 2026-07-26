import type { Plan, User } from "@prisma/client";

export type PlanInfo = {
  id: Plan;
  name: string;
  priceInr: number;
  mediaLimit: number;
  features: string[];
};

export const PLANS: Record<Plan, PlanInfo> = {
  FREE: {
    id: "FREE",
    name: "Free",
    priceInr: 0,
    mediaLimit: 3,
    features: [
      "Digital business card profile",
      "Unique QR code + download",
      "WhatsApp click-to-chat button",
      "Up to 3 gallery items",
    ],
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    priceInr: 499,
    mediaLimit: 15,
    features: [
      "Everything in Free",
      "Featured listing badge",
      "Up to 15 gallery items",
      "Higher search ranking than Free",
    ],
  },
  PREMIUM: {
    id: "PREMIUM",
    name: "Premium",
    priceInr: 999,
    mediaLimit: 40,
    features: [
      "Everything in Pro",
      "Unlock lead contact details",
      "Analytics dashboard",
      "Priority ranking in search",
      "Up to 40 gallery items",
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
