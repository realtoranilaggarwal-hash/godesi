/**
 * The done-for-you website offer Godesi runs with socialdada.com. Kept in one
 * place so the price and contact details are identical on every surface.
 */
export const WEBSITE_OFFER = {
  priceUsd: 99,
  /** Monthly charge that keeps the domain and hosting running. */
  monthlyUsd: 10,
  /** The same hosting paid a year at a time. */
  yearlyUsd: 100,
  /** One-time price of a site our designer makes from the owner's pages. */
  customPriceUsd: 499,
  /** Regular price, shown slashed next to the current one. */
  customListPriceUsd: 999,
  /** Hosting for a custom-built site, billed once a year. */
  customHostingYearUsd: 200,
  /** Code that adds a free featured ad on GoDesi to a website order. */
  giftCode: "GODESI",
  giftFeaturedMonths: 12,
  /** Yearly add-on: one article a day, with a picture and hashtags, emailed to the owner. */
  dailyArticlesUsd: 500,
  /** One-time add-on: online menu / ordering linked to the owner's payment account. */
  onlineOrderingUsd: 1000,
  /** Friends a customer refers to get the first year of hosting free. */
  referralFriends: 2,
  customPages: 10,
  /** Site changes hosting includes: one a month, or twelve a year on yearly. */
  changesPerMonth: 1,
  changesPerYear: 12,
  pages: 5,
  partner: "SocialDada",
  partnerUrl: "https://socialdada.com",
  /** Internal inbox the briefs are emailed to; never shown to members. */
  email: "godesibiz@gmail.com",
  /** Digits only, in international format, for wa.me links. */
  whatsapp: process.env.NEXT_PUBLIC_WEBSITE_OFFER_WHATSAPP ?? "17329837958",
  /** The one US contact members can call about a website. */
  phoneDisplay: "(732) 983-7958",
  phoneTel: "tel:+17329837958",
};

/** What the build covers, shown on the offer page and in the nudge. */
export const WEBSITE_OFFER_INCLUDES = [
  "5-page static website — Home, About, Services, Gallery, Contact",
  "Your logo, colours, photos and text laid out for mobile first",
  "Click-to-call and WhatsApp buttons on every page",
  "Contact form that emails you",
  "Google Business Profile and Godesi card linked in",
  "Basic on-page SEO so your name is findable on Google",
  "Domain and hosting included in the $10 monthly charge",
];

/** Prompts for the page-by-page details we ask the owner for up front. */
export const WEBSITE_OFFER_PAGE_PROMPTS = [
  { name: "page1", label: "Page 1 — Home", hint: "Headline, what you do, area you serve" },
  { name: "page2", label: "Page 2 — About", hint: "Your story, years in business, team" },
  { name: "page3", label: "Page 3 — Services", hint: "List your services or products" },
  { name: "page4", label: "Page 4 — Gallery / Work", hint: "Photos, projects, before-after" },
  { name: "page5", label: "Page 5 — Contact", hint: "Phone, WhatsApp, email, address, hours" },
];

/** Pre-filled WhatsApp enquiry for the website offer, or null if no number is set. */
export function whatsappOfferLink() {
  if (!WEBSITE_OFFER.whatsapp) return null;
  const message = `Hi Godesi, I would like a custom website for my business.`;
  return `https://wa.me/${WEBSITE_OFFER.whatsapp}?text=${encodeURIComponent(message)}`;
}

/**
 * First-year "website + content" package: the custom site plus weekly content
 * pictures, RSS, videos, a featured spot and a side banner on GoDesi.
 * Regular prices are what each item costs on its own on GoDesi.
 */
export const WEBSITE_CONTENT_PACKAGE = {
  priceUsd: 500,
  depositUsd: 250,
  items: [
    { name: "Custom website", detail: "Your pages, logo, photos, click-to-call and WhatsApp", regularUsd: WEBSITE_OFFER.customPriceUsd },
    { name: "Domain name", detail: "Free for the first year", regularUsd: 19 },
    { name: "Website hosting", detail: "Included for the first year", regularUsd: 100 },
    { name: "Weekly content emails", detail: "52 a year: a new post and picture with your GoDesi QR code", regularUsd: 52 * 5 },
    { name: "Website posts on GoDesi via RSS", detail: "Your 5 latest posts shown live on your GoDesi page", regularUsd: 0 },
    { name: "Two promotional videos", detail: "$50 each", regularUsd: 100 },
    { name: "Featured on GoDesi for a year", detail: "Featured business page and classified", regularUsd: 100 },
    { name: "320×100 side banner for a year", detail: "$24 a month, 20% off for 12 months", regularUsd: 230 },
  ],
  renewals: [
    "Domain: $19 a year",
    "Hosting: $100 a year",
    `Daily content instead of weekly (optional): $${WEBSITE_OFFER.dailyArticlesUsd} a year`,
  ],
  /** A featured business whose website posts already show on GoDesi through RSS. */
  rssExample: {
    name: "Dr. Gurudeva, Vedic astrologer",
    href: "/business/dr-gurudeva-indian-vedic-astrologer-jyotish-highland-park",
  },
  wish: "I want the $500 Website + Content package for the first year.",
};

export const websiteContentPackageRegularUsd = () =>
  WEBSITE_CONTENT_PACKAGE.items.reduce((sum, item) => sum + item.regularUsd, 0);
