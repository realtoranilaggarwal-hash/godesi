/** Search engines flag descriptions under ~110 characters as too short. */
const MIN = 110;
const MAX = 158;

/**
 * Builds a meta description of a usable length: the member's own words first,
 * then the supplied context sentences until it is long enough, cut cleanly on a
 * word boundary.
 */
export function metaDescription(...parts: (string | null | undefined)[]) {
  let text = "";
  for (const part of parts) {
    const clean = part?.replace(/\s+/g, " ").trim();
    if (!clean) continue;
    text = text ? `${text} ${clean}` : clean;
    if (text.length >= MIN) break;
  }
  if (text.length <= MAX) return text;

  const cut = text.slice(0, MAX);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > MIN ? lastSpace : MAX).replace(/[,;:.\s]+$/, "")}…`;
}
