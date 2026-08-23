/**
 * Slug picking needs the database, so it lives apart from the Elite constants:
 * those are read by client components, and a module that imports Prisma cannot
 * be bundled for the browser.
 */

import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";

export async function uniqueEliteSlug(name: string, city?: string) {
  const base = slugify(city ? `${name}-${city}` : name) || "member";
  let slug = base;
  let suffix = 1;
  while (await db.eliteEntry.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
  return slug;
}
