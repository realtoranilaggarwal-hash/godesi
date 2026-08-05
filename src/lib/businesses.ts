import type { Plan } from "@prisma/client";
import { db } from "@/lib/db";
import { CONTENT_TTL, cachedQuery } from "@/lib/cache";
import { planRank } from "@/lib/plans";

export type BusinessListItem = {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string | null;
  categoryName: string | null;
  categoryColor: string | null;
  categoryIcon: string | null;
  subcategoryName: string | null;
  city: string;
  country: string | null;
  description: string | null;
  logoUrl: string | null;
  /** First gallery image, used by the image-heavy marketplace cards. */
  coverUrl: string | null;
  startingPrice: number | null;
  priceCurrency: string | null;
  customQuote: boolean;
  whatsappNumber: string | null;
  featured: boolean;
  /** Sub-services picked from the subcategory checklist, shown as tags. */
  specialties: string[];
  featuredSpecialty: string | null;
  certifications: string[];
  /** Answers to the subcategory's option groups, e.g. "At home", "60 minutes". */
  serviceOptions: string[];
  priceFrom: string | null;
  priceHourly: string | null;
  verifiedProvider: boolean;
  yearsExperience: number | null;
  /** Cars & Bikes cards carry their vehicle spec for the tag row and filters. */
  vehicle: {
    vehicleType: string;
    make: string;
    model: string;
    year: number;
    mileage: number | null;
    mileageUnit: string;
    fuelType: string | null;
    transmission: string | null;
    ownership: string | null;
    condition: string | null;
    price: number | null;
    currency: string;
    negotiable: boolean;
  } | null;
  plan: Plan;
  rating: number;
  reviewCount: number;
};

export type SearchFilters = {
  q?: string;
  category?: string;
  /** Matches the taxonomy: a top-level slug also matches its subcategories. */
  categorySlugs?: string[];
  city?: string;
  country?: string;
  minRating?: number;
  premiumOnly?: boolean;
  /** Sub-services the card must offer (all of them).  */
  specialties?: string[];
  /** Certifications the card must hold (all of them). */
  certifications?: string[];
  /** One entry per option group; the card must match at least one value in each. */
  serviceOptionGroups?: string[][];
  /** Cars & Bikes filters; all optional and combined with AND. */
  vehicle?: {
    vehicleType?: string;
    make?: string;
    model?: string;
    fuelType?: string;
    transmission?: string;
    ownership?: string;
    condition?: string;
    minYear?: number;
    maxYear?: number;
    maxMileage?: number;
    minPrice?: number;
    maxPrice?: number;
    features?: string[];
  };
  take?: number;
  /** "recent" keeps newest-first; the default ranks paid and better-rated cards higher. */
  sort?: "ranked" | "recent";
};

/**
 * Directory pages ask for the same handful of filter combinations all day, and
 * this query joins reviews, media and both category tables, so the result is
 * held briefly instead of being rebuilt for every visitor.
 */
export async function searchBusinesses(
  filters: SearchFilters = {},
): Promise<BusinessListItem[]> {
  return cachedSearch(filters);
}

const cachedSearch = cachedQuery(
  "business-search",
  CONTENT_TTL,
  runSearchBusinesses,
);

async function runSearchBusinesses(
  filters: SearchFilters = {},
): Promise<BusinessListItem[]> {
  const {
    q,
    category,
    categorySlugs,
    city,
    country,
    minRating = 0,
    premiumOnly = false,
    specialties,
    certifications,
    serviceOptionGroups,
    vehicle,
    take = 60,
    sort = "ranked",
  } = filters;

  const optionGroups = (serviceOptionGroups ?? []).filter((group) => group.length);

  const rows = await db.business.findMany({
    where: {
      status: "APPROVED",
      ...(category
        ? { category: { equals: category, mode: "insensitive" } }
        : {}),
      ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
      ...(country ? { country: { equals: country, mode: "insensitive" } } : {}),
      ...(premiumOnly ? { owner: { plan: { in: ["PRO", "PREMIUM"] } } } : {}),
      ...(specialties?.length ? { specialties: { hasEvery: specialties } } : {}),
      ...(certifications?.length
        ? { certifications: { hasEvery: certifications } }
        : {}),
      ...(vehicle && Object.values(vehicle).some((value) => value !== undefined)
        ? {
            vehicle: {
              is: {
                ...(vehicle.vehicleType ? { vehicleType: vehicle.vehicleType } : {}),
                ...(vehicle.make ? { make: vehicle.make } : {}),
                ...(vehicle.model ? { model: vehicle.model } : {}),
                ...(vehicle.fuelType ? { fuelType: vehicle.fuelType } : {}),
                ...(vehicle.transmission ? { transmission: vehicle.transmission } : {}),
                ...(vehicle.ownership ? { ownership: vehicle.ownership } : {}),
                ...(vehicle.condition ? { condition: vehicle.condition } : {}),
                ...(vehicle.minYear !== undefined || vehicle.maxYear !== undefined
                  ? {
                      year: {
                        ...(vehicle.minYear !== undefined ? { gte: vehicle.minYear } : {}),
                        ...(vehicle.maxYear !== undefined ? { lte: vehicle.maxYear } : {}),
                      },
                    }
                  : {}),
                ...(vehicle.maxMileage !== undefined
                  ? { mileage: { lte: vehicle.maxMileage } }
                  : {}),
                ...(vehicle.minPrice !== undefined || vehicle.maxPrice !== undefined
                  ? {
                      price: {
                        ...(vehicle.minPrice !== undefined ? { gte: vehicle.minPrice } : {}),
                        ...(vehicle.maxPrice !== undefined ? { lte: vehicle.maxPrice } : {}),
                      },
                    }
                  : {}),
                ...(vehicle.features?.length
                  ? { features: { hasEvery: vehicle.features } }
                  : {}),
              },
            },
          }
        : {}),
      AND: [
        ...optionGroups.map((group) => ({
          serviceOptions: { hasSome: group },
        })),
        ...(categorySlugs?.length
          ? [
              {
                OR: [
                  { categorySlug: { in: categorySlugs } },
                  { subcategorySlug: { in: categorySlugs } },
                  // Paid cards may also appear under extra categories they picked.
                  { extraCategorySlugs: { hasSome: categorySlugs } },
                ],
              },
            ]
          : []),
        ...(q
          ? [
              {
                OR: [
                  { name: { contains: q, mode: "insensitive" as const } },
                  {
                    description: { contains: q, mode: "insensitive" as const },
                  },
                  { category: { contains: q, mode: "insensitive" as const } },
                  { city: { contains: q, mode: "insensitive" as const } },
                  {
                    categoryRef: {
                      name: { contains: q, mode: "insensitive" as const },
                    },
                  },
                  {
                    subcategoryRef: {
                      name: { contains: q, mode: "insensitive" as const },
                    },
                  },
                  // People search for the person as often as the shop name.
                  {
                    owner: {
                      name: { contains: q, mode: "insensitive" as const },
                    },
                  },
                ],
              },
            ]
          : []),
      ],
    },
    include: {
      vehicle: true,
      owner: { select: { plan: true } },
      reviews: { where: { hidden: false }, select: { rating: true } },
      categoryRef: { select: { name: true, color: true, icon: true } },
      subcategoryRef: { select: { name: true } },
      media: {
        where: { type: "IMAGE" },
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: { url: true },
      },
    },
    // Without an order the database picks arbitrary rows, so new cards never surface.
    orderBy: { createdAt: "desc" },
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
        categorySlug: row.categorySlug,
        categoryName: row.categoryRef?.name ?? null,
        categoryColor: row.categoryRef?.color ?? null,
        categoryIcon: row.categoryRef?.icon ?? null,
        subcategoryName: row.subcategoryRef?.name ?? null,
        city: row.city,
        country: row.country,
        description: row.description,
        logoUrl: row.logoUrl,
        coverUrl: row.media[0]?.url ?? null,
        startingPrice: row.startingPrice,
        priceCurrency: row.priceCurrency,
        customQuote: row.customQuote,
        whatsappNumber: row.whatsappNumber,
        featured: row.featured,
        specialties: row.specialties,
        featuredSpecialty: row.featuredSpecialty,
        certifications: row.certifications,
        serviceOptions: row.serviceOptions,
        priceFrom: row.priceFrom,
        priceHourly: row.priceHourly,
        verifiedProvider: row.verifiedProvider,
        yearsExperience: row.yearsExperience,
        vehicle: row.vehicle
          ? {
              vehicleType: row.vehicle.vehicleType,
              make: row.vehicle.make,
              model: row.vehicle.model,
              year: row.vehicle.year,
              mileage: row.vehicle.mileage,
              mileageUnit: row.vehicle.mileageUnit,
              fuelType: row.vehicle.fuelType,
              transmission: row.vehicle.transmission,
              ownership: row.vehicle.ownership,
              condition: row.vehicle.condition,
              price: row.vehicle.price,
              currency: row.vehicle.currency,
              negotiable: row.vehicle.negotiable,
            }
          : null,
        plan: row.owner?.plan ?? "FREE",
        rating,
        reviewCount,
      };
    })
    .filter((row) => row.rating >= minRating)
    .sort((a, b) =>
      sort === "recent"
        ? 0
        : planRank(b.plan) - planRank(a.plan) ||
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

export async function listCountries() {
  const rows = await db.business.findMany({
    where: { status: "APPROVED", country: { not: null } },
    select: { country: true },
    distinct: ["country"],
    orderBy: { country: "asc" },
  });
  return rows.flatMap((row) => (row.country ? [row.country] : []));
}

/** Paid and admin-featured listings, for the promoted strip above free results. */
export async function featuredBusinesses(
  categorySlugs?: string[],
  take = 12,
): Promise<BusinessListItem[]> {
  const rows = await searchBusinesses({ categorySlugs, take: 60 });
  return rows
    .filter((row) => row.featured || planRank(row.plan) > 0)
    .slice(0, take);
}
