/** Where a review reached us when staff typed it in for the customer. */
export const REVIEW_SOURCES = ["WHATSAPP", "EMAIL", "PHONE", "IN_PERSON"] as const;

export type ReviewSource = (typeof REVIEW_SOURCES)[number];

const LABELS: Record<ReviewSource, string> = {
  WHATSAPP: "Shared over WhatsApp",
  EMAIL: "Sent by email",
  PHONE: "Given over the phone",
  IN_PERSON: "Given in person",
};

/** Public wording, so nobody mistakes a relayed review for one posted here. */
export function reviewSourceLabel(source: string | null) {
  if (!source) return null;
  const label = LABELS[source as ReviewSource];
  return label ? `${label} · added by Godesi` : null;
}
