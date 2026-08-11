/**
 * Members type their city freehand, so "Iselin NJ", "iselin, nj" and "Iselin"
 * must all reach the same page: the slug drops a trailing state abbreviation.
 * Kept free of database imports so client components can use it.
 */
export function citySlug(city: string) {
  return city
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/-[a-z]{2}$/, "")
    .slice(0, 60);
}
