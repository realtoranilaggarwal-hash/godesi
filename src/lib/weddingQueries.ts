/**
 * The database half of wedding.ts — the labels and groups next door are safe for client components, but a module that touches Prisma cannot be bundled for the browser.
 */

import { db } from "@/lib/db";
import { searchBusinesses, type BusinessListItem } from "@/lib/businesses";
import { planRank } from "@/lib/plans";
import { WEDDING_SLUG, WeddingFilters, allWeddingSlugs } from "@/lib/wedding";

/** Vendors for the marketplace grid: paid and featured cards rank first. */
export async function weddingVendors(
  filters: WeddingFilters = {},
  take = 48,
): Promise<BusinessListItem[]> {
  const scope =
    filters.service && filters.service !== WEDDING_SLUG
      ? [filters.service]
      : allWeddingSlugs();

  const vendors = await searchBusinesses({
    categorySlugs: scope,
    city: filters.city,
    q: filters.q,
    minRating: filters.minRating,
    take,
  });

  const budget = filters.budget;
  if (!budget) return vendors;
  return vendors.filter(
    (vendor) => vendor.startingPrice === null || vendor.startingPrice <= budget,
  );
}

export async function weddingServiceCounts(): Promise<Map<string, number>> {
  const rows = await db.business.groupBy({
    by: ["subcategorySlug"],
    where: {
      status: "APPROVED",
      subcategorySlug: { in: allWeddingSlugs() },
    },
    _count: { subcategorySlug: true },
  });

  return new Map(
    rows
      .filter((row) => row.subcategorySlug)
      .map((row) => [
        row.subcategorySlug as string,
        row._count.subcategorySlug,
      ]),
  );
}

/** The towns wedding vendors are listed in, for the "vendors by city" rows. */
export async function weddingCities(take = 40) {
  const rows = await db.business.groupBy({
    by: ["city", "state"],
    where: { status: "APPROVED", categorySlug: WEDDING_SLUG },
    _count: { city: true },
    orderBy: { _count: { city: "desc" } },
    take,
  });

  return rows.map((row) => ({
    city: row.city,
    state: row.state,
    count: row._count.city,
  }));
}

export async function featuredWeddingVendors(take = 8) {
  const vendors = await weddingVendors({}, 60);
  return vendors
    .filter((vendor) => vendor.featured || planRank(vendor.plan) > 0)
    .slice(0, take);
}
