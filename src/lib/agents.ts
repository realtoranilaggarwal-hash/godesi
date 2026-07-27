import { formatMinor } from "@/lib/format";

/** Subcategories that get the real estate agent layout. */
export const AGENT_SUBCATEGORIES = [
  "real-estate-property-dealers",
  "professionals-realtors",
];

export const AGENT_SPECIALTIES = [
  "Buyer Agent",
  "Seller Agent",
  "Rental Specialist",
  "Commercial Real Estate",
  "Investment Properties",
  "Luxury Homes",
  "First-time Buyers",
];

export const AGENT_LICENSE_TYPES = [
  "Salesperson",
  "Broker",
  "Broker Associate",
];

export const AGENT_CERTIFICATIONS = [
  "Realtor® (NAR Member)",
  "CRS (Certified Residential Specialist)",
  "ABR (Accredited Buyer's Representative)",
  "CCIM (Commercial)",
];

export const AGENT_LANGUAGES = [
  "English",
  "Hindi",
  "Gujarati",
  "Punjabi",
  "Spanish",
  "Urdu",
  "Tamil",
  "Telugu",
  "Bengali",
  "Marathi",
];

export const SALE_SIDE_LABELS = {
  BUYER: "Buyer",
  SELLER: "Seller",
  BOTH: "Both sides",
} as const;

export const REVIEW_CRITERIA = [
  { id: "localKnowledge", label: "Local knowledge" },
  { id: "processExpertise", label: "Process expertise" },
  { id: "responsiveness", label: "Responsiveness" },
  { id: "negotiation", label: "Negotiation skills" },
] as const;

export function isAgentCard(subcategorySlug: string | null) {
  return subcategorySlug !== null && AGENT_SUBCATEGORIES.includes(subcategorySlug);
}

/** Comma separated storage keeps the schema simple; lists are read-mostly. */
export function splitList(value: string | null) {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Splits a stored list into the known checkbox values and free-text extras. */
export function partitionList(value: string | null, known: string[]) {
  const items = splitList(value);
  return {
    selected: items.filter((item) => known.includes(item)),
    other: items.filter((item) => !known.includes(item)).join(", "),
  };
}

export function joinList(values: string[]) {
  const cleaned = values.map((value) => value.trim()).filter(Boolean);
  return cleaned.length ? cleaned.join(", ") : null;
}

export function agentMoney(currency: string, minor: number | null) {
  if (minor === null) return null;
  return formatMinor(minor, currency);
}

/** Averages the optional per-criteria scores across an agent's reviews. */
export function criteriaAverages(
  reviews: {
    localKnowledge: number | null;
    processExpertise: number | null;
    responsiveness: number | null;
    negotiation: number | null;
  }[],
) {
  return REVIEW_CRITERIA.map((criterion) => {
    const scores = reviews
      .map((review) => review[criterion.id])
      .filter((score): score is number => typeof score === "number");

    return {
      ...criterion,
      average: scores.length
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : null,
      count: scores.length,
    };
  });
}
