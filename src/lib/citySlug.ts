/**
 * Members type their city freehand, so "Iselin NJ" and "iselin, nj" must reach
 * the same page. Kept free of database imports so client components can use it.
 */
export function citySlug(city: string) {
  return city
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}
