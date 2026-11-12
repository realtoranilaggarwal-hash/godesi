import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { venueNameKey } from "@/lib/venueNames";

/** How many venues the event form's dropdown offers. */
const SUGGESTION_LIMIT = 500;

/** Unique public slug for a venue, e.g. royal-alberts-palace-fords. */
async function uniqueVenueSlug(name: string, city: string, skipId?: string) {
  const base = slugify(`${name} ${city}`).slice(0, 80) || "venue";
  let slug = base;
  for (let n = 2; ; n++) {
    const clash = await db.venue.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!clash || clash.id === skipId) return slug;
    slug = `${base}-${n}`;
  }
}

/**
 * Saves the venue an organiser picked or typed so the next one can pick it
 * instead of retyping it, and remembers each hall used there. Existing details
 * are only filled in, never overwritten with blanks. Matching ignores case so a
 * venue picked from the list is found again after the form title-cases it.
 */
/**
 * The venue already listed under this name in this city, ignoring spelling
 * differences like "Royal Albert's Palace" vs "Royal Albert Palace".
 */
export async function findSameVenue(name: string, city: string) {
  const inCity = await db.venue.findMany({
    where: { city: { equals: city, mode: "insensitive" } },
  });
  const lower = name.trim().toLowerCase();
  const key = venueNameKey(name);
  return (
    inCity.find((venue) => venue.name.toLowerCase() === lower) ??
    (key
      ? inCity.find((venue) => venueNameKey(venue.name) === key)
      : undefined) ??
    null
  );
}

export async function rememberVenue({
  name,
  city,
  state,
  country,
  address,
  mapsUrl,
  website,
  hall,
}: {
  name: string;
  city: string;
  state?: string | null;
  country?: string | null;
  address?: string | null;
  mapsUrl?: string | null;
  website?: string | null;
  hall?: string | null;
}) {
  const existing = await findSameVenue(name, city);

  if (!existing) {
    return db.venue.create({
      data: {
        name,
        city,
        slug: await uniqueVenueSlug(name, city),
        state: state ?? null,
        country: country ?? null,
        address: address ?? null,
        mapsUrl: mapsUrl ?? null,
        website: website ?? null,
        halls: hall ? [hall] : [],
      },
    });
  }

  const halls =
    hall && !existing.halls.includes(hall)
      ? [...existing.halls, hall]
      : existing.halls;

  return db.venue.update({
    where: { id: existing.id },
    data: {
      slug:
        existing.slug ??
        (await uniqueVenueSlug(existing.name, existing.city, existing.id)),
      state: existing.state ?? state ?? null,
      country: existing.country ?? country ?? null,
      address: existing.address ?? address ?? null,
      mapsUrl: existing.mapsUrl ?? mapsUrl ?? null,
      website: existing.website ?? website ?? null,
      halls,
    },
  });
}

/** Venues already on Godesi, for the event form's dropdown. */
export function venueSuggestions() {
  return db.venue.findMany({
    orderBy: [{ city: "asc" }, { name: "asc" }],
    take: SUGGESTION_LIMIT,
    select: {
      id: true,
      slug: true,
      name: true,
      city: true,
      state: true,
      country: true,
      address: true,
      mapsUrl: true,
      website: true,
      halls: true,
    },
  });
}

/** Where a venue's own page lives; older rows without a slug use their id. */
export function venuePath(venue: { slug: string | null; id: string }) {
  return `/venues/${venue.slug ?? venue.id}`;
}

/** Finds a venue by its slug, or by id for links made before slugs existed. */
export function findVenue(key: string) {
  return db.venue.findFirst({ where: { OR: [{ slug: key }, { id: key }] } });
}

/** Venue owners (approved claim) and staff may edit a venue page. */
export function canEditVenue(
  user: { id: string; role: string } | null,
  venue: { ownerId: string | null },
) {
  if (!user) return false;
  return (
    user.role === "ADMIN" ||
    user.role === "MODERATOR" ||
    venue.ownerId === user.id
  );
}
