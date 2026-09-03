/** Client-safe constants and pure helpers for gigs — no db/stripe imports. */
import type { GigOrderStatus, GigTier } from "@prisma/client";

/** Whole dollars. Small enough that a dispute stays small. */
export const GIG_MIN_USD = 5;
export const GIG_MAX_USD = 100;

/** Godesi keeps this much of every paid gig; the seller gets the rest. */
export const GIG_FEE_USD = 2;

/**
 * Stripe's published US card rate, quoted on the site so the seller sees where
 * the $2 goes. Update here if the processor changes it.
 */
export const CARD_RATE_PERCENT = 2.9;
export const CARD_RATE_FIXED_USD = 0.3;

/** Days the buyer has to object after a delivery before the money moves. */
export const AUTO_RELEASE_DAYS = 7;

export const MAX_DELIVERY_DAYS = 30;
export const MAX_GIGS_PER_SELLER = 10;
export const MAX_REVISIONS = 10;
export const MAX_GIG_IMAGES = 5;
export const MAX_GIG_TAGS = 5;
export const MAX_GIG_FAQ = 5;

export const TIERS: GigTier[] = ["BASIC", "STANDARD", "PREMIUM"];
export const TIER_LABEL: Record<GigTier, string> = {
  BASIC: "Basic",
  STANDARD: "Standard",
  PREMIUM: "Premium",
};

export type GigFaq = { q: string; a: string };

/** The seller's FAQ is stored as JSON; anything malformed is dropped. */
export function faqList(value: unknown): GigFaq[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const q = "q" in item ? item.q : null;
    const a = "a" in item ? item.a : null;
    return typeof q === "string" && typeof a === "string" && q && a
      ? [{ q, a }]
      : [];
  });
}

export function averageRating(sum: number, count: number) {
  return count ? Math.round((sum / count) * 10) / 10 : 0;
}

export function gigFeeMinor() {
  return GIG_FEE_USD * 100;
}

export function sellerShareMinor(priceMinor: number) {
  return Math.max(0, priceMinor - gigFeeMinor());
}

/** What the card processor takes from a price, so the fee note can show the sum. */
export function cardCostUsd(priceUsd: number) {
  return (priceUsd * CARD_RATE_PERCENT) / 100 + CARD_RATE_FIXED_USD;
}

export function usd(minor: number) {
  return `$${(minor / 100).toFixed(minor % 100 === 0 ? 0 : 2)}`;
}

export const ORDER_LABEL: Record<GigOrderStatus, string> = {
  PENDING: "Awaiting payment",
  PAID: "In progress",
  DELIVERED: "Delivered — awaiting buyer",
  RELEASED: "Complete",
  DISPUTED: "In dispute",
  REFUNDED: "Refunded",
  CANCELLED: "Cancelled",
};

export const ORDER_TONE: Record<
  GigOrderStatus,
  "slate" | "green" | "amber" | "indigo" | "red"
> = {
  PENDING: "slate",
  PAID: "indigo",
  DELIVERED: "amber",
  RELEASED: "green",
  DISPUTED: "red",
  REFUNDED: "slate",
  CANCELLED: "slate",
};

export function includesList(includes: string | null) {
  return (includes ?? "")
    .split(/\n+/)
    .map((line) => line.trim().replace(/^[-•*]\s*/, ""))
    .filter(Boolean);
}

/** Packages in Basic → Premium order regardless of insertion. */
export function sortPackages<T extends { tier: GigTier }>(packages: T[]) {
  return [...packages].sort(
    (a, b) => TIERS.indexOf(a.tier) - TIERS.indexOf(b.tier),
  );
}
