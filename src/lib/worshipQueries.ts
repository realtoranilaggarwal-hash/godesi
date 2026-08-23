/**
 * The database half of worship.ts — the labels and helpers next door are safe for client components, but a module that touches Prisma cannot be bundled for the browser.
 */

import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";

export async function uniqueWorshipSlug(name: string, city: string) {
  const base =
    slugify([name, city].filter(Boolean).join(" ")) || "place-of-worship";
  let candidate = base;
  let counter = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await db.worshipPlace.findUnique({ where: { slug: candidate } })) {
    counter += 1;
    candidate = `${base}-${counter}`;
  }
  return candidate;
}
