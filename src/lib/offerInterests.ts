import { POINTS } from "@/lib/rewards";

/**
 * Member-benefit topics picked at signup or later from the dashboard. Picks
 * personalise the member's offers; contact about them needs the separate
 * `offerContactOk` opt-in.
 */
export type OfferInterest = {
  id: string;
  icon: string;
  label: string;
  /** Top-level directory category whose businesses can help with this topic. */
  category: string | null;
  /** Where on GoDesi a member who picked this topic finds matching help. */
  match: { href: string; label: string };
};

export const OFFER_GROUPS: { label: string; items: OfferInterest[] }[] = [
  {
    label: "Home",
    items: [
      {
        id: "buy-home",
        icon: "🏡",
        label: "Buy a home — connect me with a realtor",
        category: "real-estate",
        match: { href: "/categories/real-estate", label: "Real estate agents" },
      },
      {
        id: "sell-home",
        icon: "🪧",
        label: "Sell my home",
        category: "real-estate",
        match: { href: "/categories/real-estate", label: "Real estate agents" },
      },
      {
        id: "mortgage",
        icon: "🏦",
        label: "Mortgage or refinance rates",
        category: "financial-services",
        match: {
          href: "/categories/financial-services",
          label: "Mortgage & finance",
        },
      },
    ],
  },
  {
    label: "Money & tax",
    items: [
      {
        id: "life-insurance",
        icon: "🛡️",
        label: "Life insurance — talk to an agent",
        category: "financial-services",
        match: {
          href: "/categories/financial-services",
          label: "Insurance agents",
        },
      },
      {
        id: "health-insurance",
        icon: "🩺",
        label: "Health or Medicare insurance",
        category: "financial-services",
        match: {
          href: "/categories/financial-services",
          label: "Insurance agents",
        },
      },
      {
        id: "index-investing",
        icon: "📈",
        label: "Learn about index investing",
        category: "financial-services",
        match: {
          href: "/categories/financial-services",
          label: "Financial advisors",
        },
      },
      {
        id: "retirement",
        icon: "🧓",
        label: "Retirement, 401(k) and IRA planning",
        category: "financial-services",
        match: {
          href: "/categories/financial-services",
          label: "Financial advisors",
        },
      },
      {
        id: "save-tax",
        icon: "🧾",
        label: "Ways to save tax",
        category: "financial-services",
        match: {
          href: "/categories/financial-services",
          label: "Tax & accounting",
        },
      },
      {
        id: "back-tax-refunds",
        icon: "💵",
        label: "Claim missed 2023, 2024 or 2025 tax refunds",
        category: "financial-services",
        match: {
          href: "/categories/financial-services",
          label: "Tax & accounting",
        },
      },
      {
        id: "money-to-india",
        icon: "💱",
        label: "Better rates sending money to India",
        category: "financial-services",
        match: {
          href: "/categories/financial-services",
          label: "Money transfer",
        },
      },
      {
        id: "credit-loans",
        icon: "💳",
        label: "Credit repair or a personal loan",
        category: "financial-services",
        match: {
          href: "/categories/financial-services",
          label: "Loans & credit",
        },
      },
    ],
  },
  {
    label: "Travel",
    items: [
      {
        id: "air-tickets",
        icon: "✈️",
        label: "Discounted air tickets to India",
        category: "travel",
        match: { href: "/categories/travel", label: "Travel agents" },
      },
      {
        id: "hotel-deals",
        icon: "🏨",
        label: "Hotel and holiday deals",
        category: "travel",
        match: { href: "/categories/travel", label: "Travel deals" },
      },
      {
        id: "visitor-insurance",
        icon: "👵",
        label: "Visitor insurance for parents",
        category: "travel",
        match: { href: "/categories/travel", label: "Visitor insurance" },
      },
      {
        id: "visa-oci",
        icon: "🛂",
        label: "Visa, OCI, passport or green card help",
        category: "professionals",
        match: { href: "/visa-bulletin", label: "Immigration help" },
      },
    ],
  },
  {
    label: "Business",
    items: [
      {
        id: "franchise",
        icon: "🏪",
        label: "Start a franchise business",
        category: "business-services",
        match: {
          href: "/categories/business-services",
          label: "Business services",
        },
      },
      {
        id: "business-loans",
        icon: "💼",
        label: "Small business loans",
        category: "financial-services",
        match: {
          href: "/categories/financial-services",
          label: "Business loans",
        },
      },
      {
        id: "website-marketing",
        icon: "🌐",
        label: "Website and marketing for my business",
        category: "business-services",
        match: { href: "/website", label: "Website & marketing" },
      },
    ],
  },
  {
    label: "India",
    items: [
      {
        id: "invest-india",
        icon: "🇮🇳",
        label: "Invest in India — property, stocks, NRI accounts",
        category: "financial-services",
        match: {
          href: "/categories/financial-services",
          label: "NRI investing",
        },
      },
      {
        id: "india-property",
        icon: "🔑",
        label: "Manage or sell my property in India",
        category: "real-estate",
        match: { href: "/categories/real-estate", label: "Property help" },
      },
      {
        id: "medical-india",
        icon: "🏥",
        label: "Medical treatment in India",
        category: "health-medical",
        match: {
          href: "/categories/health-medical",
          label: "Health & medical",
        },
      },
    ],
  },
  {
    label: "Family & life",
    items: [
      {
        id: "life-partner",
        icon: "💍",
        label: "Help finding a life partner",
        category: null,
        match: { href: "/rishta", label: "Rishta profiles" },
      },
      {
        id: "wedding",
        icon: "🎊",
        label: "Wedding and event planning",
        category: "events-wedding",
        match: { href: "/categories/events-wedding", label: "Wedding vendors" },
      },
      {
        id: "tutoring",
        icon: "📚",
        label: "Tutoring and college admissions",
        category: "education",
        match: { href: "/categories/education", label: "Tutors & education" },
      },
      {
        id: "senior-care",
        icon: "🤝",
        label: "Care for elderly parents",
        category: "care-services",
        match: { href: "/categories/care-services", label: "Care services" },
      },
      {
        id: "legal-help",
        icon: "⚖️",
        label: "Lawyer — family, property or immigration",
        category: "professionals",
        match: {
          href: "/categories/professionals",
          label: "Lawyers & professionals",
        },
      },
      {
        id: "grocery-deals",
        icon: "🛒",
        label: "Indian grocery and gold/jewellery deals",
        category: "shops-retail",
        match: { href: "/deals", label: "Shops & deals" },
      },
    ],
  },
];

export const OFFER_INTERESTS: OfferInterest[] = OFFER_GROUPS.flatMap(
  (group) => group.items,
);

const BY_ID = new Map<string, OfferInterest>(
  OFFER_INTERESTS.map((item) => [item.id, item]),
);

export function offerInterest(id: string) {
  return BY_ID.get(id) ?? null;
}

export function parseOfferInterests(values: unknown[]) {
  return Array.from(new Set(values.map(String))).filter((id) => BY_ID.has(id));
}

/** Digits and a leading +, or null when nothing usable was typed. */
export function cleanOfferPhone(value: unknown) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const digits = raw.replace(/[^\d+]/g, "");
  const count = digits.replace(/\D/g, "").length;
  if (count < 7 || count > 15) {
    throw new Error(
      "That phone number doesn't look right — check the digits or leave it empty.",
    );
  }
  return digits;
}

export const BENEFITS_TITLE = "Unlock Your GoDesi Member Benefits";
export const BENEFITS_QUESTION =
  "What would you like to save money on or learn more about?";
export const BENEFITS_INTRO =
  "Choose any interests below to personalize your offers. Get access to participating business discounts, coupons, events, shopping deals, and relevant service information.";
export const BENEFITS_POINTS = [
  "Choose only the topics you care about.",
  "Browse available offers at any time.",
  "Decide separately whether you want a provider to contact you.",
  "No purchase required to join.",
  `Each topic you tick earns ${POINTS.OFFER_PICK} GoDesi points (once per topic) and one bonus spin — use points to promote your business.`,
];
export const OFFER_PRIVACY =
  "🔒 Your details are never sold or shown publicly. Businesses only see how many members want each topic. We connect you with the right vendor only if you tick the contact box below.";
export const BENEFITS_FINE_PRINT =
  "Your choices help personalize your GoDesi experience. Offers vary by provider and availability. Review each offer's terms before redeeming.";
export const CONTACT_CONSENT =
  "Yes, GoDesi and a trusted GoDesi professional may contact me by email, phone or WhatsApp about the topics I ticked. I can switch this off any time.";

/** The contact opt-in is its own unticked box; anything but "on" means no. */
export function parseOfferContact(value: unknown) {
  return value === "on";
}
