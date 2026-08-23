import type { ResourceKind } from "@prisma/client";
import type { Currency } from "@/lib/currency";
import { formatMoney } from "@/lib/format";

/** Links are sold per 1,000 views — the simplest unit advertisers understand. */
export const RESOURCE_PACKS = [1_000, 5_000, 10_000] as const;

export type ResourcePack = (typeof RESOURCE_PACKS)[number];

export const RESOURCE_CPM: Record<Currency, number> = { USD: 10, INR: 799 };

export const RESOURCE_KIND_LABELS: Record<ResourceKind, string> = {
  AFFILIATE: "Affiliate",
  SPONSORED: "Sponsored",
  EDITORIAL: "Editorial",
};

/** How many links a "Recommended links" box shows. */
export const RESOURCE_BOX_SIZE = 4;

/**
 * Named rails a link can be pinned to. A link with a placement only shows in
 * that rail; links without one flow into the normal category boxes.
 */

export const RESOURCE_PLACEMENTS = [
  { value: "connect-safety", label: "Safety tools & tips (Connect)" },
  {
    value: "event-suppliers",
    label: "Party supplies & printers (Events)",
  },
] as const;

export type ResourcePlacement = (typeof RESOURCE_PLACEMENTS)[number]["value"];

export function resourcePackOrThrow(value: string): ResourcePack {
  const impressions = Number(value);
  const match = RESOURCE_PACKS.find((pack) => pack === impressions);
  if (!match) throw new Error("Unknown views pack");
  return match;
}

export function resourcePrice(currency: Currency, impressions: number) {
  const gross = (RESOURCE_CPM[currency] * impressions) / 1000;
  return currency === "INR" ? Math.round(gross) : Math.round(gross * 100) / 100;
}

export function formatResourcePrice(currency: Currency, impressions: number) {
  return formatMoney(resourcePrice(currency, impressions), currency);
}

export type TagCount = { tag: string; count: number };

/**
 * Tag counts across everything that carries tags — resource links and events —
 * so one tag surfaces every kind of content filed under it.
 */

/**
 * Links for a "Recommended links" box. Links tagged with the page's category come
 * first; untargeted links fill the rest so a box is never nearly empty.
 */
