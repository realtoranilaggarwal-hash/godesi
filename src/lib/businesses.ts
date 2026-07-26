import type { Plan } from "@prisma/client";
import { db } from "@/lib/db";
import { planRank } from "@/lib/plans";

export type BusinessListItem = {
  id: string;
  slug: string;
  name: string;
  category: string;
  city: string;
  description: string | null;
  logoUrl: string | null;
  whatsappNumber: string;
  featured: boolean;
  plan: Plan;
  rating: number;
  reviewCount: number;
};

export type SearchFilters = {
  q?: string;
  category?: string;
  city?: string;
  minRating?: number;
  premiumOnly?: boolean;
  take?: number;
};

export async function searchBusinesses(
  filters: SearchFilters = {},
): Promise<BusinessListItem[]> {
  const { q, category, city, minRating = 0, premiumOnly = false, take = 60 } = filters;

  const rows = await db.business.findMany({
    where: {
      status: "APPROVED",
      ...(category ? { category: { equals: category, mode: "insensitive" } } : {}),
      ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
              { category: { contains: q, mode: "insensitive" } },
              { city: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(premiumOnly ? { owner: { plan: { in: ["PRO", "PREMIUM"] } } } : {}),
    },
    include: {
      owner: { select: { plan: true } },
      reviews: { select: { rating: true } },
    },
    take,
  });

  return rows
    .map((row) => {
      const reviewCount = row.reviews.length;
      const rating = reviewCount
        ? row.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        : 0;
      return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        category: row.category,
        city: row.city,
        description: row.description,
        logoUrl: row.logoUrl,
        whatsappNumber: row.whatsappNumber,
        featured: row.featured,
        plan: row.owner.plan,
        rating,
        reviewCount,
      };
    })
    .filter((row) => row.rating >= minRating)
    .sort(
      (a, b) =>
        planRank(b.plan) - planRank(a.plan) ||
        Number(b.featured) - Number(a.featured) ||
        b.rating - a.rating ||
        b.reviewCount - a.reviewCount ||
        a.name.localeCompare(b.name),
    );
}

export async function listCategories() {
  const rows = await db.business.findMany({
    where: { status: "APPROVED" },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  return rows.map((r) => r.category);
}

export async function listCities() {
  const rows = await db.business.findMany({
    where: { status: "APPROVED" },
    select: { city: true },
    distinct: ["city"],
    orderBy: { city: "asc" },
  });
  return rows.map((r) => r.city);
}
