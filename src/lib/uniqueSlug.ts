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
  while (await slugTaken(candidate)) {
    counter += 1;
    candidate = `${base}-${counter}`;
  }
  return candidate;
}

/** A page address is taken when any other card uses it now or used it before. */
export async function slugTaken(slug: string, exceptBusinessId?: string) {
  const hit = await db.business.findFirst({
    where: {
      OR: [{ slug }, { previousSlugs: { has: slug } }],
      ...(exceptBusinessId ? { id: { not: exceptBusinessId } } : {}),
    },
    select: { id: true },
  });
  return hit !== null;
}
