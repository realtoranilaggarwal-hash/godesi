import type { Currency } from "@/lib/currency";
import { AD_PLACEMENTS } from "@/lib/ads";
import { PLANS } from "@/lib/plans";
import { formatInr, formatUsd } from "@/lib/format";

/** The all-in-one package is sold by the year. */
export const BUNDLE_MONTHS = 12;

export type BundleLine = {
  label: string;
  blurb: string;
  /** Yearly list price if bought on its own. */
  inr: number;
  usd: number;
};

const premium = PLANS.PREMIUM;
const sidebar = AD_PLACEMENTS.SIDEBAR;

/**
 * Everything a business would otherwise buy piece by piece, at today's prices.
 * Items already covered by the Premium membership are priced at zero so the
 * total is what the buyer would really pay, not a padded number.
 */
export const BUNDLE_LINES: BundleLine[] = [
  {
    label: "Premium membership — 12 months",
    blurb:
      "Phone, email and website shown, 20 photos, 5 extra categories, analytics, priority ranking",
    inr: premium.priceInr * BUNDLE_MONTHS,
    usd: premium.priceUsd * BUNDLE_MONTHS,
  },
  {
    label: `${sidebar.name} — 12 months`,
    blurb: `${sidebar.size.width}x${sidebar.size.height} banner beside listings, events and news`,
    inr: sidebar.priceInr * BUNDLE_MONTHS,
    usd: sidebar.priceUsd * BUNDLE_MONTHS,
  },
  {
    label: "Featured listing all year",
    blurb: "⭐ Premium strip on the homepage and at the top of your category",
    inr: 0,
    usd: 0,
  },
  {
    label: "Unlimited enquiries",
    blurb:
      "Every requirement unlocked with the buyer's phone and email, plus WhatsApp enquiries straight to you",
    inr: 0,
    usd: 0,
  },
  {
    label: "GoDesi Elite consideration",
    blurb:
      "Your business goes forward for the Elite recognition list and awards",
    inr: 0,
    usd: 0,
  },
];

/** What the same things cost bought separately. */
export function bundleListPrice(currency: Currency) {
  return BUNDLE_LINES.reduce(
    (total, line) => total + (currency === "INR" ? line.inr : line.usd),
    0,
  );
}

export function bundlePrice(currency: Currency) {
  return currency === "INR" ? 24_999 : 299;
}

export function bundleSaving(currency: Currency) {
  const list = bundleListPrice(currency);
  const price = bundlePrice(currency);
  const amount = Math.max(0, list - price);
  return { amount, percent: list ? Math.round((amount / list) * 100) : 0 };
}

export function formatBundleMoney(amount: number, currency: Currency) {
  return currency === "INR" ? formatInr(amount) : formatUsd(amount);
}

/** Stripe charges in the smallest unit; both INR and USD have 100 of them. */
export function bundleUnitAmount(currency: Currency) {
  return Math.round(bundlePrice(currency) * 100);
}

export function describeTerm(months: number) {
  if (months % 12 === 0) {
    const years = months / 12;
    return `${years} year${years === 1 ? "" : "s"}`;
  }
  return `${months} months`;
}
