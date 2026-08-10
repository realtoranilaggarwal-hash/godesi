import { db } from "@/lib/db";
import { cachedQuery, TAXONOMY_TTL } from "@/lib/cache";
import { citySlug } from "@/lib/citySlug";

export { citySlug };

/**
 * Members type their city freehand, so the same place arrives spelled a dozen
 * ways. Every spelling that slugs to the same value is treated as one city and
 * queried together.
 */
export const cityNames = cachedQuery(
  "city-names",
  TAXONOMY_TTL,
  async (slug: string) => {
    const [businesses, reports, events, listings, worship] = await Promise.all([
      db.business.findMany({
        where: { status: "APPROVED" },
        distinct: ["city"],
        select: { city: true },
      }),
      db.newsItem.findMany({
        where: { status: "PUBLISHED", city: { not: null } },
        distinct: ["city"],
        select: { city: true },
      }),
      db.event.findMany({
        where: { status: "APPROVED" },
        distinct: ["city"],
        select: { city: true },
      }),
      db.listing.findMany({
        where: { status: "APPROVED" },
        distinct: ["city"],
        select: { city: true },
      }),
      db.worshipPlace.findMany({
        where: { status: "APPROVED" },
        distinct: ["city"],
        select: { city: true },
      }),
    ]);

    const all = [...businesses, ...reports, ...events, ...listings, ...worship]
      .map((row) => row.city)
      .filter((city): city is string => Boolean(city));

    return Array.from(new Set(all)).filter((city) => citySlug(city) === slug);
  },
);

/** Cities with enough on them to be worth a page of their own. */
export const popularCities = cachedQuery(
  "city-list",
  TAXONOMY_TTL,
  async (limit: number) => {
    const rows = await db.business.groupBy({
      by: ["city"],
      where: { status: "APPROVED" },
      _count: { city: true },
      orderBy: { _count: { city: "desc" } },
      take: limit,
    });
    // The same place arrives spelled several ways, so the chips are merged.
    const merged = new Map<string, { city: string; count: number }>();
    for (const row of rows) {
      if (!row.city) continue;
      const slug = citySlug(row.city);
      const seen = merged.get(slug);
      if (!seen) {
        merged.set(slug, { city: row.city, count: row._count.city });
      } else {
        seen.count += row._count.city;
        if (row.city.length < seen.city.length) seen.city = row.city;
      }
    }
    return Array.from(merged, ([slug, value]) => ({ slug, ...value })).sort(
      (a, b) => b.count - a.count,
    );
  },
);
