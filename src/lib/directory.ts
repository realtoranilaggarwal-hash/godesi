import { cache } from "react";
import { db } from "@/lib/db";

export const getCategoryTree = cache(async () =>
  db.category.findMany({
    where: { parentSlug: null },
    orderBy: { sortOrder: "asc" },
    include: { children: { orderBy: { sortOrder: "asc" } } },
  }),
);

export const getCategory = cache(async (slug: string) =>
  db.category.findUnique({
    where: { slug },
    include: {
      parent: true,
      children: { orderBy: { sortOrder: "asc" } },
    },
  }),
);

/** Approved-listing counts per top-level category, for the category tiles. */
export const getCategoryCounts = cache(async () => {
  const rows = await db.business.groupBy({
    by: ["categorySlug"],
    where: { status: "APPROVED", categorySlug: { not: null } },
    _count: { _all: true },
  });
  return new Map(rows.map((row) => [row.categorySlug as string, row._count._all]));
});

/** A category page shows the category plus everything under it. */
export function categoryScopeSlugs(category: {
  slug: string;
  children?: { slug: string }[];
}) {
  return [category.slug, ...(category.children ?? []).map((child) => child.slug)];
}
