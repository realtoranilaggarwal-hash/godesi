import { siteUrl } from "@/lib/format";

export const FEED_HEADERS = {
  "access-control-allow-origin": "*",
  "cache-control": "public, s-maxage=600, stale-while-revalidate=3600",
};

type PublicEvent = {
  slug: string;
  title: string;
  description: string;
  startsAt: Date;
  endsAt: Date | null;
  venue: string;
  hallName: string | null;
  address: string | null;
  mapsUrl: string | null;
  city: string;
  state: string | null;
  country: string | null;
  features: string[];
  tags: string[];
  eventType: string | null;
  mode: string;
  onlineUrl: string | null;
  websiteUrl: string | null;
  bonusNote: string | null;
  recurrence: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  albumUrl: string | null;
  price: number;
  currency: string;
  seatsTotal: number;
  seatsBooked: number;
  categorySlug: string | null;
  categorySlugs: string[];
  updatedAt: Date;
  createdAt: Date;
  speakers: { name: string; photoUrl: string | null; bio: string | null }[];
  sessions: {
    title: string;
    stage: string | null;
    speaker: string | null;
    startTime: string | null;
    endTime: string | null;
  }[];
  tiers: {
    name: string;
    price: number;
    seatsTotal: number;
    seatsBooked: number;
  }[];
  organizer: { name: string | null } | null;
  business: { name: string; slug: string } | null;
};

/**
 * The whole public record of an event, so a Godesi network site can publish a
 * full page of its own instead of a teaser. `ref` tags the links back to
 * godesi.com, where every booking is completed.
 */
export function eventJson(event: PublicEvent, ref?: string) {
  const base = siteUrl();
  const suffix = ref ? `?ref=${encodeURIComponent(ref)}` : "";
  const seatsLeft = Math.max(event.seatsTotal - event.seatsBooked, 0);

  return {
    slug: event.slug,
    title: event.title,
    description: event.description,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    venue: event.venue,
    hallName: event.hallName,
    address: event.address,
    mapsUrl: event.mapsUrl,
    city: event.city,
    state: event.state,
    country: event.country,
    features: event.features,
    tags: event.tags,
    eventType: event.eventType,
    mode: event.mode,
    onlineUrl: event.onlineUrl,
    organizerWebsite: event.websiteUrl,
    bonusNote: event.bonusNote,
    recurrence: event.recurrence,
    imageUrl: event.imageUrl,
    videoUrl: event.videoUrl,
    albumUrl: event.albumUrl,
    price: event.price,
    currency: event.currency,
    seatsTotal: event.seatsTotal,
    seatsLeft,
    soldOut: event.seatsTotal > 0 && seatsLeft === 0,
    categorySlug: event.categorySlug,
    categorySlugs: event.categorySlugs,
    organizer: event.business?.name ?? event.organizer?.name ?? null,
    organizerUrl: event.business ? `${base}/b/${event.business.slug}` : null,
    speakers: event.speakers,
    sessions: event.sessions,
    tiers: event.tiers.map((tier) => ({
      name: tier.name,
      price: tier.price,
      seatsLeft: Math.max(tier.seatsTotal - tier.seatsBooked, 0),
    })),
    updatedAt: event.updatedAt,
    createdAt: event.createdAt,
    url: `${base}/events/${event.slug}${suffix}`,
    ticketUrl: `${base}/events/${event.slug}${suffix}`,
  };
}
