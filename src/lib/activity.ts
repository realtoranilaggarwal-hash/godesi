import type { ListingKind } from "@prisma/client";
import { db } from "@/lib/db";

export type ActivityItem = {
  id: string;
  icon: string;
  text: string;
  href: string;
  at: string;
};

/** First name only — the live feed never shows full names, emails or phones. */
function firstName(name: string | null) {
  const first = (name ?? "").trim().split(/\s+/)[0];
  return first || "Someone";
}

/**
 * Recent public activity for the FOMO-style live feed: new cards, listings,
 * events, bookings and reviews. Everything shown here is already public.
 */
export async function recentActivity(limit = 20): Promise<ActivityItem[]> {
  const since = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000);

  const [businesses, listings, events, tickets, reviews] = await Promise.all([
    db.business.findMany({
      where: { status: "APPROVED", createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, slug: true, name: true, city: true, createdAt: true },
    }),
    db.listing.findMany({
      where: { status: "APPROVED", createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, slug: true, kind: true, city: true, createdAt: true },
    }),
    db.event.findMany({
      where: { status: "APPROVED", createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, slug: true, title: true, city: true, createdAt: true },
    }),
    db.ticket.findMany({
      where: { status: "CONFIRMED", createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        quantity: true,
        createdAt: true,
        event: { select: { slug: true, title: true } },
      },
    }),
    db.review.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        rating: true,
        createdAt: true,
        author: { select: { name: true } },
        business: { select: { slug: true, name: true } },
      },
    }),
  ]);

  const listingLabel: Record<ListingKind, string> = {
    PROPERTY_SALE: "listed a property for sale",
    PROPERTY_RENT: "listed a property for rent",
    ROOM_OFFERED: "posted a room to share",
    ROOM_WANTED: "is looking for a room",
    MARKETPLACE: "listed an item for sale",
  };

  const items: ActivityItem[] = [
    ...businesses.map((business) => ({
      id: `b-${business.id}`,
      icon: "🏪",
      text: `${business.name} joined Godesi in ${business.city}`,
      href: `/b/${business.slug}`,
      at: business.createdAt.toISOString(),
    })),
    ...listings.map((listing) => ({
      id: `l-${listing.id}`,
      icon: listing.kind === "MARKETPLACE" ? "🛍️" : "🏠",
      text: `Someone ${listingLabel[listing.kind]} in ${listing.city}`,
      href: `/listings/${listing.slug}`,
      at: listing.createdAt.toISOString(),
    })),
    ...events.map((event) => ({
      id: `e-${event.id}`,
      icon: "🎉",
      text: `New event in ${event.city}: ${event.title}`,
      href: `/events/${event.slug}`,
      at: event.createdAt.toISOString(),
    })),
    ...tickets.map((ticket) => ({
      id: `t-${ticket.id}`,
      icon: "🎟️",
      text: `${ticket.quantity} seat${ticket.quantity === 1 ? "" : "s"} booked for ${ticket.event.title}`,
      href: `/events/${ticket.event.slug}`,
      at: ticket.createdAt.toISOString(),
    })),
    ...reviews.map((review) => ({
      id: `r-${review.id}`,
      icon: "⭐",
      text: `${firstName(review.author?.name ?? null)} rated ${review.business.name} ${review.rating}/5`,
      href: `/b/${review.business.slug}`,
      at: review.createdAt.toISOString(),
    })),
  ];

  return items
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, limit);
}
