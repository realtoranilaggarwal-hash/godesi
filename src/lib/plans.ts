import type { Plan, User } from "@prisma/client";
import type { Currency } from "@/lib/currency";

export type TermId = "MONTH" | "YEAR" | "FIVE_YEAR";

export type Price = { inr: number; usd: number };

export type PlanInfo = {
  id: Plan;
  name: string;
  priceInr: number;
  /** PayPal cannot settle INR, so paid plans are also priced in USD. */
  priceUsd: number;
  /** What each term costs; a term the plan does not sell is absent. */
  terms: Partial<Record<TermId, Price>>;
  mediaLimit: number;
  /** Local news reports a member may publish in a rolling week. */
  newsPostsPerWeek: number;
  features: string[];
};

/** The five-year price is a founding offer, and it stops on this date. */
export const FOUNDING_OFFER_ENDS = new Date("2026-12-31T23:59:59Z");

export function foundingOfferOpen(now: Date = new Date()) {
  return now.getTime() <= FOUNDING_OFFER_ENDS.getTime();
}

export const FOUNDING_OFFER_ENDS_LABEL = "31 December 2026";

export const PLAN_TERMS: Record<
  TermId,
  { id: TermId; months: number; label: string; founding: boolean }
> = {
  MONTH: { id: "MONTH", months: 1, label: "a month", founding: false },
  YEAR: { id: "YEAR", months: 12, label: "a year", founding: false },
  FIVE_YEAR: {
    id: "FIVE_YEAR",
    months: 60,
    label: "5 years",
    founding: true,
  },
};

export function termOrThrow(value: string): TermId {
  if (value === "MONTH" || value === "YEAR" || value === "FIVE_YEAR")
    return value;
  throw new Error("Unknown term");
}

/** Terms a plan can actually be bought for, cheapest first. */
export function planTerms(plan: PlanInfo, now: Date = new Date()): TermId[] {
  return (Object.keys(PLAN_TERMS) as TermId[]).filter(
    (id) =>
      Boolean(plan.terms[id]) &&
      (!PLAN_TERMS[id].founding || foundingOfferOpen(now)),
  );
}

export function planTermPrice(
  plan: PlanInfo,
  term: TermId,
  currency: Currency,
): number | null {
  const price = plan.terms[term];
  if (!price) return null;
  return currency === "INR" ? price.inr : price.usd;
}

export const PLANS: Record<Plan, PlanInfo> = {
  FREE: {
    id: "FREE",
    name: "Free",
    priceInr: 0,
    priceUsd: 0,
    terms: {},
    mediaLimit: 1,
    newsPostsPerWeek: 1,
    features: [
      "Digital business card profile",
      "Unique QR code + download",
      "WhatsApp click-to-chat button",
      "1 uploaded photo",
      "1 YouTube video and 6 photos from your Google Photos album",
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
    terms: {
      MONTH: { inr: 499, usd: 5.99 },
      YEAR: { inr: 2_999, usd: 59 },
    },
    mediaLimit: 3,
    newsPostsPerWeek: 10,
    features: [
      "Everything in Free",
      "Listed above free cards in your category",
      "Up to 3 uploaded photos",
      "2 YouTube videos and 15 photos from your Google Photos album",
      "Phone and email shown on your listing (you can hide them)",
      "3 categories in all — your main one plus 2 more",
      "No Godesi service fee on ticket sales",
      "10 news stories a week",
      "Higher search ranking than Free",
    ],
  },
  PREMIUM: {
    id: "PREMIUM",
    name: "Featured",
    priceInr: 999,
    priceUsd: 50,
    terms: {
      MONTH: { inr: 999, usd: 50 },
      YEAR: { inr: 4_999, usd: 600 },
      FIVE_YEAR: { inr: 4_999, usd: 600 },
    },
    mediaLimit: 5,
    newsPostsPerWeek: 10,
    features: [
      "Everything in Pro",
      "Gold ring and Featured ribbon on your card for the whole term",
      "Top of your category, above Pro and free cards",
      "Phone and email shown to everyone (a switch you can turn off)",
      "Up to 5 uploaded photos",
      "3 YouTube videos and 30 photos from your Google Photos album",
      "5 categories in all — your main one plus 4 more",
      "Unlock lead contact details",
      "Get ticket money paid straight into your own Stripe account",
      "Analytics dashboard",
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

const VIDEO_LIMITS: Record<Plan, number> = { FREE: 1, PRO: 2, PREMIUM: 3 };

/** The ceiling, used when staff edit a card on the owner's behalf. */
export const MAX_VIDEO_LIMIT = VIDEO_LIMITS.PREMIUM;

/**
 * Showcase videos a card may embed. One is free — a DJ's set or a photographer's
 * reel — and paid plans turn the page into a proper showreel. Founding members
 * keep the paid allowance as part of their seat.
 */
export function videoLimit(
  user: Pick<User, "plan" | "planExpiresAt" | "foundingNumber">,
) {
  if (user.foundingNumber !== null) return VIDEO_LIMITS.PREMIUM;
  return VIDEO_LIMITS[effectivePlan(user)];
}

const ALBUM_PHOTO_LIMITS: Record<Plan, number> = { FREE: 6, PRO: 15, PREMIUM: 30 };

/**
 * Thumbnails shown from a member's public Google Photos album. Google hosts the
 * pictures, so the cap is a plan perk rather than a storage cost, and the album
 * link itself always opens the rest.
 */
export function albumPhotoLimit(
  user: Pick<User, "plan" | "planExpiresAt" | "foundingNumber"> | null,
) {
  if (!user) return ALBUM_PHOTO_LIMITS.FREE;
  if (user.foundingNumber !== null) return ALBUM_PHOTO_LIMITS.PREMIUM;
  return ALBUM_PHOTO_LIMITS[effectivePlan(user)];
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
  PREMIUM: 4,
};
