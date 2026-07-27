import type { Furnishing, GenderPreference, ListingKind, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { formatInr } from "@/lib/format";
import { slugify } from "@/lib/slug";

export type ListingSection = "real-estate" | "rooms" | "marketplace";

export const KIND_LABELS: Record<ListingKind, string> = {
  PROPERTY_SALE: "For sale",
  PROPERTY_RENT: "For rent",
  ROOM_WANTED: "Need a room",
  ROOM_OFFERED: "Have a room",
  MARKETPLACE: "Buy & sell",
};

export const FURNISHING_LABELS: Record<Furnishing, string> = {
  FURNISHED: "Furnished",
  SEMI_FURNISHED: "Semi-furnished",
  UNFURNISHED: "Unfurnished",
};

export const GENDER_LABELS: Record<GenderPreference, string> = {
  ANY: "Anyone",
  MALE: "Male only",
  FEMALE: "Female only",
};

export const SECTION_KINDS: Record<ListingSection, ListingKind[]> = {
  "real-estate": ["PROPERTY_SALE", "PROPERTY_RENT"],
  rooms: ["ROOM_WANTED", "ROOM_OFFERED"],
  marketplace: ["MARKETPLACE"],
};

/** Rooms are always monthly; sales and items are one-off prices. */
export function isMonthly(kind: ListingKind) {
  return kind === "PROPERTY_RENT" || kind === "ROOM_OFFERED" || kind === "ROOM_WANTED";
}

export function priceLabel(listing: { priceInr: number; perMonth: boolean }) {
  if (!listing.priceInr) return "Price on request";
  return listing.perMonth
    ? `${formatInr(listing.priceInr)}/month`
    : formatInr(listing.priceInr);
}

export async function uniqueListingSlug(title: string, city: string) {
  const base = slugify([title, city].filter(Boolean).join(" ")) || "listing";
  let candidate = base;
  let counter = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await db.listing.findUnique({ where: { slug: candidate } })) {
    counter += 1;
    candidate = `${base}-${counter}`;
  }
  return candidate;
}

export type ListingFilters = {
  kind?: string;
  city?: string;
  max?: string;
  furnishing?: string;
  gender?: string;
  bedrooms?: string;
  q?: string;
};

function intOrNull(value?: string) {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Builds the Prisma filter for a section page from URL search params. */
export function listingWhere(
  section: ListingSection,
  filters: ListingFilters,
): Prisma.ListingWhereInput {
  const kinds = SECTION_KINDS[section];
  const kind =
    filters.kind && kinds.includes(filters.kind as ListingKind)
      ? (filters.kind as ListingKind)
      : null;
  const max = intOrNull(filters.max);
  const bedrooms = intOrNull(filters.bedrooms);

  return {
    status: "APPROVED",
    kind: kind ? kind : { in: kinds },
    ...(filters.city ? { city: { contains: filters.city, mode: "insensitive" } } : {}),
    ...(max ? { priceInr: { lte: max, gt: 0 } } : {}),
    ...(bedrooms ? { bedrooms: { gte: bedrooms } } : {}),
    ...(filters.furnishing && filters.furnishing in FURNISHING_LABELS
      ? { furnishing: filters.furnishing as Furnishing }
      : {}),
    ...(filters.gender && filters.gender in GENDER_LABELS && filters.gender !== "ANY"
      ? { genderPref: { in: [filters.gender as GenderPreference, "ANY"] } }
      : {}),
    ...(filters.q
      ? {
          OR: [
            { title: { contains: filters.q, mode: "insensitive" } },
            { description: { contains: filters.q, mode: "insensitive" } },
            { area: { contains: filters.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

export const LISTING_INCLUDE = {
  images: { orderBy: { sortOrder: "asc" } },
  owner: { select: { name: true, username: true, avatarUrl: true } },
} satisfies Prisma.ListingInclude;
