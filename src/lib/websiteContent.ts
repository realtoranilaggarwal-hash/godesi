import { aiEnabled, askGemini } from "@/lib/ai";
import {
  POWER_UPS,
  type FoundFacts,
  type PowerUp,
  type QuotedItem,
  type SiteContent,
  WEBSITE_GOALS,
} from "@/lib/websiteBuilder";

/**
 * Writes the words on the preview site. Gemini drafts them from the facts we
 * found and the owner's goals; when the key is missing or the model returns
 * rubbish, a plain template written from the same facts stands in, so the
 * funnel never dead-ends on an AI hiccup.
 */

export type ProjectBrief = {
  businessName: string;
  category: string;
  city: string;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  address?: string | null;
  goals: string[];
  wish?: string | null;
  changeNotes?: string | null;
  found: FoundFacts | null;
};

function firstJson(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as unknown;
  } catch {
    return null;
  }
}

const str = (value: unknown, max = 400) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

function asContent(raw: unknown): SiteContent | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  const services = Array.isArray(data.services)
    ? data.services
        .map((item) => {
          const row = (item ?? {}) as Record<string, unknown>;
          return { name: str(row.name, 80), description: str(row.description, 240) };
        })
        .filter((item) => item.name)
        .slice(0, 8)
    : [];
  const faq = Array.isArray(data.faq)
    ? data.faq
        .map((item) => {
          const row = (item ?? {}) as Record<string, unknown>;
          return { q: str(row.q, 160), a: str(row.a, 400) };
        })
        .filter((item) => item.q && item.a)
        .slice(0, 6)
    : [];
  const whyUs = Array.isArray(data.whyUs)
    ? data.whyUs.map((item) => str(item, 120)).filter(Boolean).slice(0, 5)
    : [];
  const content: SiteContent = {
    headline: str(data.headline, 120),
    tagline: str(data.tagline, 200),
    about: str(data.about, 900),
    services,
    whyUs,
    cta: str(data.cta, 60) || "Get in touch",
    seoTitle: str(data.seoTitle, 70),
    seoDescription: str(data.seoDescription, 170),
    faq,
  };
  if (!content.headline || !content.about || services.length < 2) return null;
  return content;
}

const DEFAULT_SERVICES: Record<string, string[]> = {
  Restaurant: ["Dine in", "Takeaway", "Catering", "Party orders"],
  Realtor: ["Buying a home", "Selling a home", "Rentals", "Investment property"],
  Doctor: ["Consultations", "Check-ups", "Follow-up care", "Telehealth"],
  Lawyer: ["Consultations", "Immigration", "Business law", "Family matters"],
  Salon: ["Haircuts", "Colour", "Bridal", "Threading & facials"],
  Contractor: ["Renovations", "Repairs", "New builds", "Free estimates"],
  Consultant: ["Strategy", "Advisory", "Training", "Ongoing support"],
  Retail: ["In-store shopping", "Special orders", "Gift items", "Seasonal collections"],
  "Professional Service": ["Consultations", "Ongoing service", "Support", "Custom work"],
  Other: ["Our services", "Consultations", "Custom requests", "Support"],
};

/** A plain but complete draft from the facts alone. */
export function templateContent(brief: ProjectBrief): SiteContent {
  const services = (
    brief.found?.services?.length
      ? brief.found.services
      : DEFAULT_SERVICES[brief.category] ?? DEFAULT_SERVICES.Other
  )
    .slice(0, 6)
    .map((name) => ({
      name,
      description: `Ask us about ${name.toLowerCase()} — we are happy to help.`,
    }));
  const about =
    brief.found?.description ??
    `${brief.businessName} is a ${brief.category.toLowerCase()} serving ${brief.city} and the surrounding area. We are proud to be part of the local desi community and welcome everyone.`;
  return {
    headline: brief.businessName,
    tagline: `${brief.category} in ${brief.city}`,
    about,
    services,
    whyUs: [
      "Local and family run",
      "Honest prices, no surprises",
      "Reply within a day",
      `Serving ${brief.city} for years`,
    ],
    cta: "Get in touch",
    seoTitle: `${brief.businessName} — ${brief.category} in ${brief.city}`,
    seoDescription: about.slice(0, 160),
    faq: [
      { q: "Where are you located?", a: brief.address ?? `We are in ${brief.city}.` },
      { q: "How do I reach you?", a: "Call, WhatsApp or use the form on this page." },
    ],
  };
}

const goalLabel = (key: string) =>
  WEBSITE_GOALS.find((goal) => goal.key === key)?.label ?? key;

/** Drafts the site copy with Gemini, falling back to the template. */
export async function writeContent(brief: ProjectBrief): Promise<SiteContent> {
  const fallback = templateContent(brief);
  if (!aiEnabled()) return fallback;

  const facts = brief.found;
  const system = `You write website copy for small businesses run by the South Asian diaspora. Write warm, plain, confident English. No clichés like "nestled" or "passionate". Never invent facts (awards, years, prices) that are not given. Return ONLY JSON matching:
{"headline":string(<=60 chars),"tagline":string(<=140),"about":string(2 short paragraphs, <=700 chars),"services":[{"name":string,"description":string(<=200)}] (4-6 items),"whyUs":[string](3-4 short reasons),"cta":string(<=30),"seoTitle":string(<=60),"seoDescription":string(<=155),"faq":[{"q":string,"a":string}] (3-4 items)}`;

  const user = [
    `Business: ${brief.businessName}`,
    `Category: ${brief.category}`,
    `City: ${brief.city}`,
    brief.address ? `Address: ${brief.address}` : "",
    facts?.description ? `Existing description: ${facts.description}` : "",
    facts?.services?.length ? `Known services: ${facts.services.join("; ")}` : "",
    facts?.hours?.length ? `Hours: ${facts.hours.join("; ")}` : "",
    facts?.rating ? `Google rating ${facts.rating} from ${facts.reviewCount ?? "?"} reviews` : "",
    facts?.reviews?.length
      ? `Customer reviews (quote the spirit, not verbatim): ${facts.reviews
          .slice(0, 4)
          .map((review) => review.text.slice(0, 200))
          .join(" | ")}`
      : "",
    brief.goals.length
      ? `Customers should be able to: ${brief.goals.map(goalLabel).join(", ")}`
      : "",
    brief.wish ? `Owner also wants: ${brief.wish}` : "",
    brief.changeNotes ? `OWNER'S CHANGE REQUESTS (apply these): ${brief.changeNotes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const text = await askGemini({ system, turns: [{ role: "user", content: user }] });
    return asContent(firstJson(text)) ?? fallback;
  } catch {
    return fallback;
  }
}

/**
 * Turns "I want customers to book a table" into a priced cart line. Catalogue
 * matches reuse the Power-Up price; anything else gets an estimate the desk
 * confirms before the site goes live.
 */
export async function quoteWish(
  wish: string,
  powerUps: PowerUp[],
): Promise<QuotedItem[]> {
  const text = wish.trim();
  if (!text) return [];
  const catalogue = powerUps
    .filter((item) => item.active)
    .map((item) => `${item.key}: ${item.label} — ${item.description} ($${item.monthlyUsd}/mo)`)
    .join("\n");

  if (!aiEnabled()) return keywordQuote(text, powerUps);

  const system = `You price website features for a small-business website builder. Given the owner's wish and the feature catalogue, return ONLY JSON: {"items":[{"label":string(<=50),"monthlyUsd":integer,"note":string(<=140),"powerUp":string|null}]} with 1-3 items. If a wish is covered by a catalogue feature, set "powerUp" to its key and copy its price. If not, set powerUp null and estimate a fair monthly price between 5 and 60 USD, noting it is an estimate to be confirmed. If the wish is already part of a basic website (call button, contact form, map, photos, text changes) return one item with monthlyUsd 0 and note "Included in your website".
Catalogue:
${catalogue}`;

  try {
    const reply = await askGemini({ system, turns: [{ role: "user", content: text }] });
    const raw = firstJson(reply) as { items?: unknown } | null;
    if (!raw || !Array.isArray(raw.items)) return keywordQuote(text, powerUps);
    const items = raw.items
      .map((item): QuotedItem | null => {
        const row = (item ?? {}) as Record<string, unknown>;
        const label = str(row.label, 50);
        const price = Math.round(Number(row.monthlyUsd));
        if (!label || !Number.isFinite(price) || price < 0 || price > 200) return null;
        const key = typeof row.powerUp === "string" ? row.powerUp : null;
        const match = powerUps.find((entry) => entry.key === key);
        return match
          ? { label: match.label, monthlyUsd: match.monthlyUsd, note: match.description, powerUp: match.key }
          : { label, monthlyUsd: price, note: str(row.note, 140) || "Estimate — confirmed before launch" };
      })
      .filter((item): item is QuotedItem => item !== null)
      .slice(0, 3);
    return items.length ? items : keywordQuote(text, powerUps);
  } catch {
    return keywordQuote(text, powerUps);
  }
}

const KEYWORDS: { test: RegExp; key: (typeof POWER_UPS)[number]["key"] }[] = [
  { test: /book|appointment|reserv|table|schedul/i, key: "booking" },
  { test: /chat|assistant|receptionist|answer/i, key: "ai-chat" },
  { test: /shop|store|sell|cart|product|menu order|order online/i, key: "store" },
  { test: /pay|deposit|invoice|checkout/i, key: "payments" },
  { test: /review|rating|stars/i, key: "google-reviews" },
  { test: /seo|google rank|search/i, key: "seo" },
  { test: /crm|hubspot|salesforce|zoho/i, key: "crm" },
  { test: /email|newsletter/i, key: "email" },
  { test: /analytic|stat|track/i, key: "analytics" },
  { test: /lead|qualif|prospect/i, key: "lead-qualification" },
  { test: /whatsapp/i, key: "whatsapp-leads" },
];

function keywordQuote(text: string, powerUps: PowerUp[]): QuotedItem[] {
  const hit = KEYWORDS.find((rule) => rule.test.test(text));
  const match = hit ? powerUps.find((item) => item.key === hit.key) : null;
  if (match) {
    return [{ label: match.label, monthlyUsd: match.monthlyUsd, note: match.description, powerUp: match.key }];
  }
  return [
    {
      label: text.slice(0, 50),
      monthlyUsd: 0,
      note: "Our team will price this and confirm with you before launch.",
    },
  ];
}
