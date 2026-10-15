/**
 * Member-benefit topics picked at signup or later from the dashboard. Picks
 * personalise the member's offers; contact about them needs the separate
 * `offerContactOk` opt-in.
 */
export type OfferInterest = { id: string; icon: string; label: string };

export const OFFER_GROUPS: { label: string; items: OfferInterest[] }[] = [
  {
    label: "Home",
    items: [
      {
        id: "buy-home",
        icon: "🏡",
        label: "Buy a home — connect me with a realtor",
      },
      { id: "sell-home", icon: "🪧", label: "Sell my home" },
      { id: "mortgage", icon: "🏦", label: "Mortgage or refinance rates" },
    ],
  },
  {
    label: "Money & tax",
    items: [
      {
        id: "life-insurance",
        icon: "🛡️",
        label: "Life insurance — talk to an agent",
      },
      {
        id: "health-insurance",
        icon: "🩺",
        label: "Health or Medicare insurance",
      },
      {
        id: "index-investing",
        icon: "📈",
        label: "Learn about index investing",
      },
      {
        id: "retirement",
        icon: "🧓",
        label: "Retirement, 401(k) and IRA planning",
      },
      { id: "save-tax", icon: "🧾", label: "Ways to save tax" },
      {
        id: "back-tax-refunds",
        icon: "💵",
        label: "Claim missed 2023, 2024 or 2025 tax refunds",
      },
      {
        id: "money-to-india",
        icon: "💱",
        label: "Better rates sending money to India",
      },
      {
        id: "credit-loans",
        icon: "💳",
        label: "Credit repair or a personal loan",
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
      },
      { id: "hotel-deals", icon: "🏨", label: "Hotel and holiday deals" },
      {
        id: "visitor-insurance",
        icon: "👵",
        label: "Visitor insurance for parents",
      },
      {
        id: "visa-oci",
        icon: "🛂",
        label: "Visa, OCI, passport or green card help",
      },
    ],
  },
  {
    label: "Business",
    items: [
      { id: "franchise", icon: "🏪", label: "Start a franchise business" },
      { id: "business-loans", icon: "💼", label: "Small business loans" },
      {
        id: "website-marketing",
        icon: "🌐",
        label: "Website and marketing for my business",
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
      },
      {
        id: "india-property",
        icon: "🔑",
        label: "Manage or sell my property in India",
      },
      { id: "medical-india", icon: "🏥", label: "Medical treatment in India" },
    ],
  },
  {
    label: "Family & life",
    items: [
      { id: "life-partner", icon: "💍", label: "Help finding a life partner" },
      { id: "wedding", icon: "🎊", label: "Wedding and event planning" },
      { id: "tutoring", icon: "📚", label: "Tutoring and college admissions" },
      { id: "senior-care", icon: "🤝", label: "Care for elderly parents" },
      {
        id: "legal-help",
        icon: "⚖️",
        label: "Lawyer — family, property or immigration",
      },
      {
        id: "grocery-deals",
        icon: "🛒",
        label: "Indian grocery and gold/jewellery deals",
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
  "Each topic you pick gives you one bonus spin of the GoDesi wheel.",
];
export const BENEFITS_FINE_PRINT =
  "Your choices help personalize your GoDesi experience. Offers vary by provider and availability. Review each offer's terms before redeeming.";
export const CONTACT_CONSENT =
  "Yes, GoDesi and a trusted GoDesi professional may contact me by email, phone or WhatsApp about the topics I ticked. I can switch this off any time.";

/** The contact opt-in is its own unticked box; anything but "on" means no. */
export function parseOfferContact(value: unknown) {
  return value === "on";
}
