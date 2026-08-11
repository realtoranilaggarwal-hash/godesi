import { cache } from "react";
import { db } from "@/lib/db";
import { TAXONOMY_TTL, cachedQuery } from "@/lib/cache";
import { optionalRead } from "@/lib/resilient";

/** The header renders this on every page, so it is cached across requests too. */
const categoryTree = cachedQuery("category-tree", TAXONOMY_TTL, async () =>
  db.category.findMany({
    where: { parentSlug: null },
    orderBy: { sortOrder: "asc" },
    include: { children: { orderBy: { sortOrder: "asc" } } },
  }),
);

// The tree is navigation, present on nearly every page: when the database is
// unreachable the page still renders, just without category links.
export const getCategoryTree = cache(async () =>
  optionalRead(() => categoryTree(), []),
);

const categoryBySlug = cachedQuery(
  "category-by-slug",
  TAXONOMY_TTL,
  async (slug: string) =>
    db.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: { orderBy: { sortOrder: "asc" } },
      },
    }),
);

export const getCategory = cache(async (slug: string) => categoryBySlug(slug));

/** Approved-listing counts per top-level category, for the category tiles. */
const categoryCounts = cachedQuery(
  "category-counts",
  TAXONOMY_TTL,
  async () => {
    const rows = await db.business.groupBy({
      by: ["categorySlug"],
      where: { status: "APPROVED", categorySlug: { not: null } },
      _count: { _all: true },
    });
    return rows.map(
      (row) => [row.categorySlug as string, row._count._all] as const,
    );
  },
);

export const getCategoryCounts = cache(
  async () => new Map(await categoryCounts()),
);

/** A category page shows the category plus everything under it. */
export function categoryScopeSlugs(category: {
  slug: string;
  children?: { slug: string }[];
}) {
  return [
    category.slug,
    ...(category.children ?? []).map((child) => child.slug),
  ];
}
