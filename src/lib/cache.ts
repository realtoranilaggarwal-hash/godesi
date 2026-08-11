import { revalidateTag, unstable_cache } from "next/cache";

/**
 * Public pages read the same rows for every visitor, so each request was paying
 * for the same database round trips. Results are held for a short window; the
 * page still renders per request, it just stops re-querying.
 */
export function cachedQuery<Args extends unknown[], Result>(
  key: string,
  seconds: number,
  fn: (...args: Args) => Promise<Result>,
) {
  return unstable_cache(fn, [key], { revalidate: seconds, tags: [key] });
}

/** Long enough that the taxonomy is effectively free, short enough to edit live. */
export const TAXONOMY_TTL = 900;
/** Listings and stories change often, so a minute keeps the page fresh. */
export const CONTENT_TTL = 60;

/** Called after a card is posted, edited or approved so it appears at once. */
export function invalidateDirectory() {
  revalidateTag("business-search");
  revalidateTag("category-counts");
}

/** Called when the category tree itself changes. */
export function invalidateTaxonomy() {
  revalidateTag("category-tree");
  revalidateTag("category-by-slug");
  revalidateTag("category-counts");
}
