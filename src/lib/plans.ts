import type { Plan, User } from "@prisma/client";

export type PlanInfo = {
  id: Plan;
  name: string;
  priceInr: number;
  /** PayPal cannot settle INR, so paid plans are also priced in USD. */
  priceUsd: number;
  mediaLimit: number;
  /** Local news reports a member may publish in a rolling week. */
  newsPostsPerWeek: number;
  features: string[];
};

export const PLANS: Record<Plan, PlanInfo> = {
  FREE: {
    id: "FREE",
    name: "Free",
    priceInr: 0,
    priceUsd: 0,
    mediaLimit: 5,
    newsPostsPerWeek: 1,
    features: [
      "Digital business card profile",
      "Unique QR code + download",
      "WhatsApp click-to-chat button",
      "Up to 5 uploaded images",
      "One category only",
      "Phone, email and links hidden in your description",
      "Post events and sell tickets (Godesi keeps a 2% service fee)",
      "1 news story a week",
    ],
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    priceInr: 499,
    priceUsd: 5.99,
    mediaLimit: 20,
    newsPostsPerWeek: 10,
    features: [
      "Everything in Free",
      "Featured listing badge",
      "Up to 20 uploaded images",
      "Phone and email shown on your listing",
      "List under 2 extra categories",
      "No Godesi service fee on ticket sales",
      "10 news stories a week",
      "Higher search ranking than Free",
    ],
  },
  PREMIUM: {
    id: "PREMIUM",
    name: "Premium",
    priceInr: 999,
    priceUsd: 11.99,
    mediaLimit: 20,
    newsPostsPerWeek: 10,
    features: [
      "Everything in Pro",
      "Unlock lead contact details",
      "List under 5 extra categories",
      "Get ticket money paid straight into your own Stripe account",
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
 * Photos allowed on a single listing. A free listing gets one — the cover shot
 * — and is pointed at a Google Photos album for the rest, which costs us no
 * storage and lets a seller show a whole house.
 */
export function listingImageLimit(user: Pick<User, "plan" | "planExpiresAt">) {
  return effectivePlan(user) === "FREE" ? 1 : PLANS[effectivePlan(user)].mediaLimit;
}

/**
 * Founding members post without a weekly cap while we are still filling the
 * site with content; everyone else gets their plan's allowance.
 */
export function newsPostsPerWeek(
  user: Pick<User, "plan" | "planExpiresAt" | "foundingNumber">,
) {
  if (user.foundingNumber !== null) return Number.POSITIVE_INFINITY;
  return PLANS[effectivePlan(user)].newsPostsPerWeek;
}

/** Direct Stripe payouts are the top-tier perk; everyone else is settled by Godesi. */
export function canReceiveDirectPayouts(user: Pick<User, "plan" | "planExpiresAt">) {
  return effectivePlan(user) === "PREMIUM";
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
