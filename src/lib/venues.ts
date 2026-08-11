import { db } from "@/lib/db";

/** How many venue suggestions the event form offers. */
const SUGGESTION_LIMIT = 300;

/**
 * Saves the venue an organiser typed so the next one can pick it instead of
 * retyping it, and remembers each hall used there. Existing address and map
 * details are only filled in, never overwritten with blanks.
 */
export async function rememberVenue({
  name,
  city,
  state,
  country,
  address,
  mapsUrl,
  hall,
}: {
  name: string;
  city: string;
  state?: string | null;
  country?: string | null;
  address?: string | null;
  mapsUrl?: string | null;
  hall?: string | null;
}) {
  const existing = await db.venue.findUnique({
    where: { name_city: { name, city } },
  });

  if (!existing) {
    return db.venue.create({
      data: {
        name,
        city,
        state: state ?? null,
        country: country ?? null,
        address: address ?? null,
        mapsUrl: mapsUrl ?? null,
        halls: hall ? [hall] : [],
      },
    });
  }

  const halls =
    hall && !existing.halls.includes(hall) ? [...existing.halls, hall] : existing.halls;

  return db.venue.update({
    where: { id: existing.id },
    data: {
      state: existing.state ?? state ?? null,
      country: existing.country ?? country ?? null,
      address: existing.address ?? address ?? null,
      mapsUrl: existing.mapsUrl ?? mapsUrl ?? null,
      halls,
    },
  });
}

/** Venues already used on Godesi, for the posting form's suggestions. */
export function venueSuggestions() {
  return db.venue.findMany({
    orderBy: { name: "asc" },
    take: SUGGESTION_LIMIT,
    select: {
      id: true,
      name: true,
      city: true,
      state: true,
      country: true,
      address: true,
      mapsUrl: true,
      halls: true,
    },
  });
}
