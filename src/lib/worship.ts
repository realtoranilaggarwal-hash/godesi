import type { Faith, Prisma } from "@prisma/client";

export const FAITH_LABELS: Record<Faith, string> = {
  HINDU_TEMPLE: "Hindu temple",
  GURUDWARA: "Gurudwara",
  MOSQUE: "Mosque",
  CHURCH: "Church",
  JAIN_TEMPLE: "Jain temple",
  BUDDHIST_TEMPLE: "Buddhist temple",
  OTHER: "Other",
};

export const FAITH_ICONS: Record<Faith, string> = {
  HINDU_TEMPLE: "🛕",
  GURUDWARA: "🪯",
  MOSQUE: "🕌",
  CHURCH: "⛪",
  JAIN_TEMPLE: "🪷",
  BUDDHIST_TEMPLE: "☸️",
  OTHER: "🙏",
};

export const FAITHS = Object.keys(FAITH_LABELS) as Faith[];

export function isFaith(value?: string | null): value is Faith {
  return Boolean(value && value in FAITH_LABELS);
}

export type WorshipFilters = {
  faith?: string;
  city?: string;
  country?: string;
  q?: string;
};

export function worshipWhere(
  filters: WorshipFilters,
): Prisma.WorshipPlaceWhereInput {
  return {
    status: "APPROVED",
    ...(isFaith(filters.faith) ? { faith: filters.faith } : {}),
    ...(filters.city
      ? { city: { contains: filters.city, mode: "insensitive" } }
      : {}),
    ...(filters.country ? { country: filters.country } : {}),
    ...(filters.q
      ? {
          OR: [
            { name: { contains: filters.q, mode: "insensitive" } },
            { address: { contains: filters.q, mode: "insensitive" } },
            { city: { contains: filters.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

export function mapsUrl(place: {
  name: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
}) {
  const query =
    place.latitude != null && place.longitude != null
      ? `${place.latitude},${place.longitude}`
      : `${place.name}, ${place.city}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export const WORSHIP_INCLUDE = {
  images: { orderBy: { sortOrder: "asc" } },
  submittedBy: { select: { name: true, username: true, avatarUrl: true } },
} satisfies Prisma.WorshipPlaceInclude;
