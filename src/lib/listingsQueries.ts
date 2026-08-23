/**
 * The database half of listings.ts — the labels and helpers next door are safe for client components, but a module that touches Prisma cannot be bundled for the browser.
 */

import { db } from "@/lib/db";
import { TAXONOMY_TTL, cachedQuery } from "@/lib/cache";
import { slugify } from "@/lib/slug";
import { MARKETPLACE_ROOT } from "@/lib/listings";

/** Subcategories a seller picks from: jewellery, furniture, electronics… */
export const marketplaceCategories = cachedQuery(
  "marketplace-categories",
  TAXONOMY_TTL,
  async () =>
    db.category.findMany({
      where: { parentSlug: MARKETPLACE_ROOT },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true },
    }),
);

export async function uniqueListingSlug(title: string, city: string) {
  const base = slugify([title, city].filter(Boolean).join(" ")) || "listing";
  let candidate = base;
  let counter = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await db.listing.findUnique({ where: { slug: candidate } })) {
    counter += 1;
    candidate = `${base}-${counter}`;
  }
  return candidate;
}
