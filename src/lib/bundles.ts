import type { BannerSlot } from "@prisma/client";
import type { Currency } from "@/lib/currency";
import { AD_PLACEMENTS } from "@/lib/ads";
import { ELITE_PACKAGES } from "@/lib/elite";
import { PLANS } from "@/lib/plans";
import { formatInr, formatUsd } from "@/lib/format";

/** The founding package sells five years of membership and Elite in one go. */
export const BUNDLE_MONTHS = 60;

/** Banner add-ons are still booked a year at a time. */
export const BANNER_TERM_MONTHS = 12;

export type CartItemKey =
  | "membership"
  | "banner-sidebar"
  | "banner-header"
  | "banner-hero"
  | "banner-skyscraper"
  | "banner-billboard"
  | "banner-leaderboard"
  | "banner-incontent"
  | "banner-halfpage"
  | "banner-mobile"
  | "banner-fullbanner"
  | "elite";

export type CartItem = {
  key: CartItemKey;
  label: string;
  blurb: string;
  /** Yearly list price if bought on its own. */
  inr: number;
  usd: number;
  /** Banner add-ons are booked as an ad order for the desk to place. */
  slot?: BannerSlot;
  /** The two lines the discounted package is built from. */
  inBundle: boolean;
};

const featured = PLANS.PREMIUM;

function bannerItem(
  key: CartItemKey,
  slot: BannerSlot,
  inBundle: boolean,
): CartItem {
  const placement = AD_PLACEMENTS[slot];
  return {
    key,
    label: `${placement.name} — 12 months`,
    blurb: `${placement.size.width}x${placement.size.height} · ${placement.blurb}`,
    inr: placement.priceInr * BANNER_TERM_MONTHS,
    usd: placement.priceUsd * BANNER_TERM_MONTHS,
    slot,
    inBundle,
  };
}

export const CART_ITEMS: CartItem[] = [
  {
    key: "membership",
    label: "Featured membership — 5 years",
    blurb:
      "Gold ring and Featured ribbon, top of your category, phone and email shown, 5 photos, 3 videos, 30 album photos, 10 categories, enquiry contacts unlocked, analytics and your own Stripe payouts",
    inr: featured.terms.FIVE_YEAR?.inr ?? featured.priceInr,
    usd: featured.terms.FIVE_YEAR?.usd ?? featured.priceUsd,
    inBundle: true,
  },
  bannerItem("banner-sidebar", "SIDEBAR", false),
  bannerItem("banner-header", "HEADER", false),
  bannerItem("banner-hero", "HERO", false),
  bannerItem("banner-skyscraper", "SKYSCRAPER", false),
  bannerItem("banner-billboard", "BILLBOARD", false),
  bannerItem("banner-leaderboard", "LEADERBOARD", false),
  bannerItem("banner-incontent", "INCONTENT", false),
  bannerItem("banner-halfpage", "HALFPAGE", false),
  bannerItem("banner-mobile", "MOBILE", false),
  bannerItem("banner-fullbanner", "FULLBANNER", false),
  {
    key: "elite",
    label: "GoDesi Elite interview + profile for 5 years — launch offer",
    blurb:
      "One-time. We interview you by phone, WhatsApp, Zoom or Facebook Live and publish your GoDesi Elite profile with a 30–60 second video, held for five years. Normally $500 for one year.",
    inr: 19_999,
    usd: ELITE_PACKAGES.INTERVIEW.usd,
    inBundle: true,
  },
];

/** Thrown in with the membership at no extra charge. */
export const BUNDLE_EXTRAS = [
  "Gold ring and Featured ribbon for the whole five years",
  "⭐ Featured badge on the homepage and at the top of your category",
  "Unlimited enquiries — every requirement unlocked with phone and email",
  "WhatsApp button and QR code on your card",
  "Put forward for GoDesi Elite recognition and the awards list",
];

export function cartItem(key: string): CartItem | undefined {
  return CART_ITEMS.find((item) => item.key === key);
}

export function itemPrice(item: CartItem, currency: Currency) {
  return currency === "INR" ? item.inr : item.usd;
}

const BUNDLE_KEYS = CART_ITEMS.filter((item) => item.inBundle).map(
  (item) => item.key,
);

/** List price of the two package lines bought separately. */
export function bundleListPrice(currency: Currency) {
  return CART_ITEMS.filter((item) => item.inBundle).reduce(
    (total, item) => total + itemPrice(item, currency),
    0,
  );
}

export function bundlePrice(currency: Currency) {
  return currency === "INR" ? 21_999 : 750;
}

export function bundleSaving(currency: Currency) {
  const list = bundleListPrice(currency);
  const amount = Math.max(0, list - bundlePrice(currency));
  return { amount, percent: list ? Math.round((amount / list) * 100) : 0 };
}

export type CartTotals = {
  items: CartItem[];
  /** Everything in the cart at list price. */
  listTotal: number;
  /** What they actually pay, with the package discount applied. */
  total: number;
  saving: number;
  savingPercent: number;
  bundleApplied: boolean;
};

/**
 * Prices a cart from item keys alone — the browser never sends prices, so a
 * tampered form cannot change what is charged.
 */
export function priceCart(keys: string[], currency: Currency): CartTotals {
  const items = CART_ITEMS.filter((item) => keys.includes(item.key));
  const listTotal = items.reduce(
    (total, item) => total + itemPrice(item, currency),
    0,
  );

  const bundleApplied = BUNDLE_KEYS.every((key) => keys.includes(key));
  const extras = items
    .filter((item) => !item.inBundle)
    .reduce((total, item) => total + itemPrice(item, currency), 0);
  const total = bundleApplied ? bundlePrice(currency) + extras : listTotal;
  const saving = Math.max(0, listTotal - total);

  return {
    items,
    listTotal,
    total,
    saving,
    savingPercent: listTotal ? Math.round((saving / listTotal) * 100) : 0,
    bundleApplied,
  };
}

export function formatBundleMoney(amount: number, currency: Currency) {
  return currency === "INR" ? formatInr(amount) : formatUsd(amount);
}

/** Stripe charges in the smallest unit; both INR and USD have 100 of them. */
export function toBundleMinor(amount: number) {
  return Math.round(amount * 100);
}

export function describeTerm(months: number) {
  if (months % 12 === 0) {
    const years = months / 12;
    return `${years} year${years === 1 ? "" : "s"}`;
  }
  return `${months} months`;
}
