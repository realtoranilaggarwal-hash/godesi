/**
 * Per-subcategory specialisation checklists. Attorneys pick the legal services
 * they take on; the same list drives the posting form and the search filters so
 * a tag can never exist that nobody can filter by.
 */
export type SpecialtySet = {
  title: string;
  hint: string;
  options: string[];
};

export const SPECIALTY_SETS: Record<string, SpecialtySet> = {
  "professionals-attorneys": {
    title: "Select legal services",
    hint: "Pick at least one — these show as tags on your card and let people filter for you.",
    options: [
      "Family Law (Divorce, Custody)",
      "Immigration Law",
      "Real Estate Law",
      "Criminal Defense",
      "Business / Corporate Law",
      "Personal Injury",
      "Estate Planning",
      "Tax Law",
      "Bankruptcy Law",
      "Employment Law",
      "Civil Litigation",
      "Contract Law",
      "Intellectual Property",
      "Insurance Claims",
      "Traffic / DUI",
    ],
  },
};

export function specialtySet(subcategorySlug?: string | null): SpecialtySet | null {
  if (!subcategorySlug) return null;
  return SPECIALTY_SETS[subcategorySlug] ?? null;
}

/** Keeps only values the subcategory actually offers, de-duplicated. */
export function cleanSpecialties(
  subcategorySlug: string | null | undefined,
  values: string[],
): string[] {
  const set = specialtySet(subcategorySlug);
  if (!set) return [];
  return set.options.filter((option) => values.includes(option));
}
