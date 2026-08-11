/**
 * The done-for-you website offer Godesi runs with socialdada.com. Kept in one
 * place so the price and contact details are identical on every surface.
 */
export const WEBSITE_OFFER = {
  priceUsd: 299,
  /** Monthly charge that keeps the domain and hosting running. */
  monthlyUsd: 10,
  pages: 5,
  partner: "SocialDada",
  partnerUrl: "https://socialdada.com",
  /** Internal inbox the briefs are emailed to; never shown to members. */
  email: "godesibiz@gmail.com",
  /** Digits only, in international format, for wa.me links. */
  whatsapp: process.env.NEXT_PUBLIC_WEBSITE_OFFER_WHATSAPP ?? "17329837958",
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
  const message = `Hi Godesi, I would like the $${WEBSITE_OFFER.priceUsd} website for my business.`;
  return `https://wa.me/${WEBSITE_OFFER.whatsapp}?text=${encodeURIComponent(message)}`;
}
