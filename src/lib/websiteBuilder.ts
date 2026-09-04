/**
 * The "build my website" funnel: catalogue of categories, goals and features,
 * the shapes stored on a WebsiteProject, and the design variants a preview can
 * be rolled into. Shared by server and client, so nothing here touches the
 * database or the network.
 */
import { WEBSITE_OFFER } from "@/lib/websiteOffer";

export const WEBSITE_CATEGORIES = [
  "Restaurant",
  "Realtor",
  "Doctor",
  "Lawyer",
  "Salon",
  "Contractor",
  "Consultant",
  "Retail",
  "Professional Service",
  "Other",
] as const;

/** Where a business may already exist online; each takes one pasted link. */
export const WEBSITE_SOURCES = [
  { key: "google", label: "Google Business Profile / Google Maps", placeholder: "https://maps.app.goo.gl/…" },
  { key: "yelp", label: "Yelp", placeholder: "https://www.yelp.com/biz/…" },
  { key: "website", label: "Current website", placeholder: "https://…" },
  { key: "facebook", label: "Facebook page", placeholder: "https://facebook.com/…" },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/…" },
] as const;

export type WebsiteSourceKey = (typeof WEBSITE_SOURCES)[number]["key"];
export type WebsiteSources = Partial<Record<WebsiteSourceKey, string>>;

/** What customers should be able to do — plain words, never "plugin" or "API". */
export const WEBSITE_GOALS = [
  { key: "call", label: "Call you", emoji: "📞" },
  { key: "whatsapp", label: "WhatsApp you", emoji: "💬" },
  { key: "inquiry", label: "Send an inquiry", emoji: "✉️" },
  { key: "quote", label: "Request a quote", emoji: "🧾" },
  { key: "appointment", label: "Book an appointment", emoji: "📅" },
  { key: "consultation", label: "Schedule a consultation", emoji: "🗓️" },
  { key: "buy", label: "Buy products", emoji: "🛒" },
  { key: "pay", label: "Make a payment", emoji: "💳" },
  { key: "order-food", label: "Order food", emoji: "🍽️" },
  { key: "service", label: "Request a service", emoji: "🛠️" },
  { key: "lead-form", label: "Submit a lead form", emoji: "📝" },
  { key: "ai-chat", label: "Chat with an AI assistant", emoji: "🤖" },
  { key: "directions", label: "Get directions", emoji: "📍" },
  { key: "reviews", label: "See your Google reviews", emoji: "⭐" },
  { key: "email-list", label: "Join your email list", emoji: "📧" },
  { key: "downloads", label: "Download documents", emoji: "📄" },
] as const;

export type WebsiteGoalKey = (typeof WEBSITE_GOALS)[number]["key"];

/** Goals the base website covers with no extra charge. */
export const FREE_GOALS: WebsiteGoalKey[] = [
  "call",
  "whatsapp",
  "inquiry",
  "quote",
  "service",
  "lead-form",
  "directions",
  "downloads",
];

/**
 * Website features ("Power-Ups") sold on top of the base site. Prices here are
 * the defaults; admin overrides live in WebsitePowerUp. All bill monthly so one
 * Stripe subscription carries the lot.
 */
export const POWER_UPS = [
  {
    key: "ai-chat",
    emoji: "💬",
    label: "AI Website Chat",
    monthlyUsd: 19,
    description: "Let website visitors ask questions 24/7.",
    goals: ["ai-chat"],
  },
  {
    key: "booking",
    emoji: "📅",
    label: "Online Booking",
    monthlyUsd: 15,
    description: "Customers book appointments directly from your website.",
    goals: ["appointment", "consultation"],
  },
  {
    key: "store",
    emoji: "🛒",
    label: "Online Store",
    monthlyUsd: 29,
    description: "Sell products directly from your website.",
    goals: ["buy", "order-food"],
  },
  {
    key: "payments",
    emoji: "💳",
    label: "Online Payments",
    monthlyUsd: 19,
    description: "Accept payments online. Card processor fees apply on top.",
    goals: ["pay"],
  },
  {
    key: "whatsapp-leads",
    emoji: "📲",
    label: "WhatsApp Lead Capture",
    monthlyUsd: 9,
    description: "Website inquiries land straight in your WhatsApp.",
    goals: [],
  },
  {
    key: "google-reviews",
    emoji: "⭐",
    label: "Google Reviews",
    monthlyUsd: 9,
    description: "Your Google reviews shown on the site, updated automatically.",
    goals: ["reviews"],
  },
  {
    key: "seo",
    emoji: "📈",
    label: "Advanced SEO",
    monthlyUsd: 25,
    description: "Extra local SEO pages, schema, metadata and optimisation.",
    goals: [],
  },
  {
    key: "analytics",
    emoji: "📊",
    label: "Analytics Dashboard",
    monthlyUsd: 9,
    description: "Track visitors, leads, calls and website activity.",
    goals: [],
  },
  {
    key: "lead-qualification",
    emoji: "🤖",
    label: "AI Lead Qualification",
    monthlyUsd: 19,
    description: "AI asks visitors questions and flags the serious prospects.",
    goals: [],
  },
  {
    key: "email",
    emoji: "📧",
    label: "Business Email",
    monthlyUsd: 3,
    description: "Professional email on your own domain (you@yourbusiness.com).",
    goals: ["email-list"],
  },
  {
    key: "crm",
    emoji: "🔗",
    label: "CRM Integration",
    monthlyUsd: 20,
    description: "Website leads sent automatically to your CRM.",
    goals: [],
  },
] as const;

export type PowerUpKey = (typeof POWER_UPS)[number]["key"];

export type PowerUp = {
  key: PowerUpKey;
  emoji: string;
  label: string;
  monthlyUsd: number;
  description: string;
  goals: readonly string[];
  active: boolean;
};

export function isPowerUpKey(value: string): value is PowerUpKey {
  return POWER_UPS.some((item) => item.key === value);
}

/** Merges the code catalogue with admin price overrides. */
export function mergePowerUps(
  overrides: { key: string; monthlyUsd: number; active: boolean }[],
): PowerUp[] {
  return POWER_UPS.map((item) => {
    const override = overrides.find((row) => row.key === item.key);
    return {
      ...item,
      monthlyUsd: override?.monthlyUsd ?? item.monthlyUsd,
      active: override?.active ?? true,
    };
  });
}

/** Power-Ups the chosen goals call for, so the cart starts pre-ticked. */
export function suggestedPowerUps(goals: string[]) {
  return POWER_UPS.filter((item) =>
    item.goals.some((goal) => goals.includes(goal)),
  ).map((item) => item.key);
}

/** Included with every site — shown as "Included" rows in the price table. */
export const BASE_INCLUDES = [
  "Mobile website",
  "SSL certificate",
  "Basic SEO",
  "Contact form",
  "Click-to-call and WhatsApp buttons",
  "Custom domain (yours, or one we register)",
];

export const BASE_SETUP_USD = WEBSITE_OFFER.priceUsd;
export const BASE_MONTHLY_USD = WEBSITE_OFFER.monthlyUsd;

/** Something the owner asked for in words, priced by the AI into the cart. */
export type QuotedItem = {
  label: string;
  monthlyUsd: number;
  note: string;
  /** Set when the wish is really one of the catalogue Power-Ups. */
  powerUp?: PowerUpKey;
};

/** What the public pages told us about the business. */
export type FoundFacts = {
  name?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  hours?: string[];
  photos: string[];
  rating?: number;
  reviewCount?: number;
  reviews?: { author?: string; text: string; rating?: number }[];
  services?: string[];
  /** Which sources actually answered. */
  from: string[];
};

export const EMPTY_FACTS: FoundFacts = { photos: [], from: [] };

/** AI-written copy for every section of the preview. */
export type SiteContent = {
  headline: string;
  tagline: string;
  about: string;
  services: { name: string; description: string }[];
  whyUs: string[];
  cta: string;
  seoTitle: string;
  seoDescription: string;
  faq: { q: string; a: string }[];
};

export const PALETTES = [
  { name: "Saffron", primary: "#c2410c", accent: "#f59e0b", dark: "#1c1917", light: "#fff7ed" },
  { name: "Indigo", primary: "#4338ca", accent: "#e11d48", dark: "#0f172a", light: "#eef2ff" },
  { name: "Emerald", primary: "#047857", accent: "#f59e0b", dark: "#052e16", light: "#ecfdf5" },
  { name: "Royal", primary: "#6d28d9", accent: "#f472b6", dark: "#1e1b4b", light: "#f5f3ff" },
  { name: "Slate", primary: "#0f172a", accent: "#0ea5e9", dark: "#020617", light: "#f8fafc" },
  { name: "Ruby", primary: "#be123c", accent: "#fbbf24", dark: "#1f0a12", light: "#fff1f2" },
] as const;

export const FONTS = [
  { name: "Modern", heading: "Georgia, 'Times New Roman', serif", body: "system-ui, -apple-system, 'Segoe UI', sans-serif" },
  { name: "Clean", heading: "system-ui, -apple-system, 'Segoe UI', sans-serif", body: "system-ui, -apple-system, 'Segoe UI', sans-serif" },
  { name: "Classic", heading: "'Playfair Display', Georgia, serif", body: "Georgia, serif" },
] as const;

export const HERO_STYLES = ["photo", "split", "solid"] as const;
export const SECTION_ORDERS = [
  ["services", "about", "gallery", "why", "reviews", "faq", "contact"],
  ["about", "services", "reviews", "gallery", "why", "faq", "contact"],
  ["gallery", "services", "why", "about", "reviews", "faq", "contact"],
] as const;

export type Design = {
  seed: number;
  palette: (typeof PALETTES)[number];
  font: (typeof FONTS)[number];
  hero: (typeof HERO_STYLES)[number];
  order: (typeof SECTION_ORDERS)[number];
  rounded: boolean;
};

/** Every seed maps to one look, so a preview link always renders the same way. */
export function designFor(seed: number): Design {
  const n = Math.abs(Math.trunc(seed));
  return {
    seed: n,
    palette: PALETTES[n % PALETTES.length],
    font: FONTS[Math.floor(n / PALETTES.length) % FONTS.length],
    hero: HERO_STYLES[Math.floor(n / 2) % HERO_STYLES.length],
    order: SECTION_ORDERS[Math.floor(n / 3) % SECTION_ORDERS.length],
    rounded: n % 4 !== 3,
  };
}

/** The next seed that changes palette, type and layout at once. */
export function nextDesignSeed(seed: number) {
  return seed + 7;
}

export const WEBSITE_STEPS = [
  "Find my business",
  "Check the facts",
  "What it should do",
  "Preview",
  "Features & launch",
] as const;

export function websitePath(id: string, tail = "") {
  return `/website/build/${id}${tail}`;
}
