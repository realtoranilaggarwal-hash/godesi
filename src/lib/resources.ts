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

/**
 * Two links point at the same place even when one carries www., a trailing
 * slash or http:// — comparing the tidied form is what catches a link that was
 * added twice.
 */
export function normalizeLinkUrl(value: string) {
  const raw = value.trim();
  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./i, "").toLowerCase();
    const path = url.pathname.replace(/\/+$/, "").toLowerCase();
    return `${host}${path}${url.search}`;
  } catch {
    return raw.toLowerCase();
  }
}

export type DedupeRow = {
  id: string;
  url: string;
  impressions: number;
  clicks: number;
  paid: boolean;
};

/**
 * Ids of every extra copy of a link. The copy worth keeping is the one someone
 * paid for, else the one with the most traffic behind it, else the oldest —
 * rows are expected in the order they were created.
 */
export function duplicateLinkIds(rows: DedupeRow[]) {
  const groups = new Map<string, DedupeRow[]>();
  for (const row of rows) {
    const key = normalizeLinkUrl(row.url);
    const group = groups.get(key);
    if (group) group.push(row);
    else groups.set(key, [row]);
  }

  const extras: string[] = [];
  for (const group of Array.from(groups.values())) {
    if (group.length < 2) continue;
    const ranked = group
      .map((row, index) => ({ row, index }))
      .sort(
        (a, b) =>
          Number(b.row.paid) - Number(a.row.paid) ||
          b.row.impressions +
            b.row.clicks -
            (a.row.impressions + a.row.clicks) ||
          a.index - b.index,
      );
    extras.push(...ranked.slice(1).map((entry) => entry.row.id));
  }
  return extras;
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
