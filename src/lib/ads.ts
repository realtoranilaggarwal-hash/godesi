import type { BannerSlot } from "@prisma/client";
import type { Currency } from "@/lib/currency";
import { formatInr, formatUsd } from "@/lib/format";

export type AdPlacement = {
  slot: BannerSlot;
  name: string;
  size: { width: number; height: number };
  slots: number;
  blurb: string;
  /** Monthly rate per placement. */
  priceInr: number;
  priceUsd: number;
  /** Indicative rate per 1,000 impressions. */
  cpmInr: number;
  cpmUsd: number;
  highlights: string[];
};

export const AD_PLACEMENTS: Record<BannerSlot, AdPlacement> = {
  HEADER: {
    slot: "HEADER",
    name: "Header leaderboard",
    size: { width: 970, height: 90 },
    slots: 1,
    blurb: "Top of every page, above the fold — the highest-visibility slot on Godesi.",
    priceInr: 7999,
    priceUsd: 95,
    cpmInr: 320,
    cpmUsd: 3.8,
    highlights: [
      "Appears on every page of the site",
      "Only one advertiser at a time",
      "Best for brand launches and offers",
    ],
  },
  SIDEBAR: {
    slot: "SIDEBAR",
    name: "Sidebar medium rectangle",
    size: { width: 300, height: 250 },
    slots: 10,
    blurb: "Classic 300x250 in the sponsored rail beside listings, events and news.",
    priceInr: 2499,
    priceUsd: 29,
    cpmInr: 180,
    cpmUsd: 2.2,
    highlights: [
      "10 rotating slots across the directory",
      "Shown on category, search, events and news pages",
      "Great value for local businesses",
    ],
  },
  SKYSCRAPER: {
    slot: "SKYSCRAPER",
    name: "Skyscraper",
    size: { width: 160, height: 600 },
    slots: 4,
    blurb: "Tall 160x600 unit that stays visible as visitors scroll long listing pages.",
    priceInr: 3999,
    priceUsd: 47,
    cpmInr: 240,
    cpmUsd: 2.9,
    highlights: [
      "Long dwell time on scroll-heavy pages",
      "Four slots only — low clutter",
      "Ideal for events, courses and offers",
    ],
  },
};

export const AD_SLOT_ORDER: BannerSlot[] = ["HEADER", "SIDEBAR", "SKYSCRAPER"];

export const AD_DURATIONS = [1, 3, 6, 12] as const;
export type AdDuration = (typeof AD_DURATIONS)[number];

/** Longer bookings get a discount: 3 months −5%, 6 −10%, 12 −20%. */
export function durationDiscount(months: number) {
  if (months >= 12) return 0.2;
  if (months >= 6) return 0.1;
  if (months >= 3) return 0.05;
  return 0;
}

export function adPrice(
  placement: AdPlacement,
  currency: Currency,
  months = 1,
) {
  const base = currency === "INR" ? placement.priceInr : placement.priceUsd;
  const gross = base * months * (1 - durationDiscount(months));
  return currency === "INR" ? Math.round(gross) : Math.round(gross * 100) / 100;
}

export function formatMoney(value: number, currency: Currency) {
  return currency === "INR" ? formatInr(value) : formatUsd(value);
}

export function formatAdPrice(
  placement: AdPlacement,
  currency: Currency,
  months = 1,
) {
  return formatMoney(adPrice(placement, currency, months), currency);
}

export function formatCpm(placement: AdPlacement, currency: Currency) {
  return currency === "INR"
    ? formatInr(placement.cpmInr)
    : formatUsd(placement.cpmUsd);
}

export function placementOrThrow(value: string): AdPlacement {
  const placement = AD_PLACEMENTS[value as BannerSlot];
  if (!placement) throw new Error("Unknown ad placement");
  return placement;
}

export function durationOrThrow(value: string): AdDuration {
  const months = Number(value);
  const match = AD_DURATIONS.find((item) => item === months);
  if (!match) throw new Error("Unknown ad duration");
  return match;
}

export function ctr(impressions: number, clicks: number) {
  if (!impressions) return 0;
  return (clicks / impressions) * 100;
}

export function formatCtr(impressions: number, clicks: number) {
  return `${ctr(impressions, clicks).toFixed(2)}%`;
}
