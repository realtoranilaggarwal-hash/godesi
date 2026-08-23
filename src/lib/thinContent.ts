import type { Metadata } from "next";

/**
 * Google's publisher policies judge a whole domain by its weakest pages: a card
 * that is only a name, a city and a phone number counts as "low value content"
 * even when the rest of the directory is good. Pages that fail these checks stay
 * out of the index and carry no network ads until somebody fills them in.
 */
export const MIN_DESCRIPTION_CHARS = 160;

/** A listing index (category, city, filter) needs this many cards to be worth indexing. */
export const MIN_INDEXABLE_RESULTS = 3;

export const NOINDEX: Metadata["robots"] = { index: false, follow: true };

export function robotsFor(thin: boolean): Metadata["robots"] | undefined {
  return thin ? NOINDEX : undefined;
}

type ThinBusiness = {
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  albumUrl: string | null;
  videoUrl: string | null;
  address: string | null;
  specialties: string[];
  ownerId: string | null;
  mediaCount?: number;
  reviewCount?: number;
};

/**
 * A card earns its place in search when the owner has written about it, or when
 * it carries at least two other pieces of real substance (photos, a website, an
 * album, a video, services, an address, reviews).
 */
export function businessIsThin(business: ThinBusiness): boolean {
  const described =
    (business.description?.trim().length ?? 0) >= MIN_DESCRIPTION_CHARS;
  if (described) return false;

  const substance = [
    business.logoUrl,
    business.websiteUrl,
    business.albumUrl,
    business.videoUrl,
    business.address,
    business.specialties.length > 0 || null,
    (business.mediaCount ?? 0) > 0 || null,
    (business.reviewCount ?? 0) > 0 || null,
    business.ownerId,
  ].filter(Boolean).length;

  return substance < 2;
}

type ThinEvent = {
  description: string | null;
  sourceId: string | null;
  claimedAt: Date | null;
  imageUrl: string | null;
  albumUrl: string | null;
  videoUrl: string | null;
  websiteUrl: string | null;
};

/**
 * Events we imported from a public calendar are somebody else's copy until the
 * organiser claims the page and fills it in, so they are followed but not indexed.
 */
export function eventIsThin(event: ThinEvent): boolean {
  const described =
    (event.description?.trim().length ?? 0) >= MIN_DESCRIPTION_CHARS;
  const imported = event.sourceId !== null && event.claimedAt === null;
  if (imported && !described) return true;
  if (described) return false;

  const substance = [
    event.imageUrl,
    event.albumUrl,
    event.videoUrl,
    event.websiteUrl,
  ].filter(Boolean).length;

  return substance < 1;
}

/** A near-empty listing index page: nothing for a searcher to land on. */
export function resultsAreThin(count: number): boolean {
  return count < MIN_INDEXABLE_RESULTS;
}
