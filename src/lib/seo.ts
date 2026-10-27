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

/**
 * Search engines flag rendered titles over ~60-65 characters as too long, and
 * the root layout appends " | GoDesi" (9 chars) — so the page segment caps at 52.
 */
const TITLE_MAX = 52;

/** Cuts an over-long page title cleanly on a word boundary. */
export function pageTitle(title: string) {
  const clean = title.replace(/\s+/g, " ").trim();
  if (clean.length <= TITLE_MAX) return clean;
  const cut = clean.slice(0, TITLE_MAX - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 30 ? lastSpace : TITLE_MAX - 1).replace(/[,;:.\s—–-]+$/, "")}…`;
}
