/**
 * Picking an unused slug needs the database, so it sits apart from `slugify`:
 * client components use the plain text helper, and a module that imports Prisma
 * cannot be bundled for the browser.
 */

import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";

export async function uniqueSlug(name: string, city?: string) {
  const base = slugify([name, city].filter(Boolean).join(" ")) || "business";
  let candidate = base;
  let counter = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await db.business.findUnique({ where: { slug: candidate } })) {
    counter += 1;
    candidate = `${base}-${counter}`;
  }
  return candidate;
}
