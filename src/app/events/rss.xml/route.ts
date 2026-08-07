import { db } from "@/lib/db";
import { rssResponse } from "@/lib/rss";

export const dynamic = "force-dynamic";

/** Upcoming community events, optionally narrowed with `?city=`. */
export async function GET(request: Request) {
  const city = new URL(request.url).searchParams.get("city")?.trim() || null;

  const events = await db.event.findMany({
    where: {
      status: "APPROVED",
      startsAt: { gte: new Date() },
      ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
    },
    orderBy: { startsAt: "asc" },
    take: 50,
    select: {
      slug: true,
      title: true,
      description: true,
      imageUrl: true,
      startsAt: true,
      createdAt: true,
      venue: true,
      city: true,
      state: true,
      eventType: true,
    },
  });

  return rssResponse({
    title: city ? `Godesi events in ${city}` : "Godesi events",
    description: city
      ? `Upcoming desi community events in ${city} — festivals, concerts, workshops and meetups, with online tickets.`
      : "Upcoming desi community events — festivals, concerts, workshops and meetups, with online tickets on Godesi.",
    path: "/events",
    items: events.map((event) => ({
      title: `${event.title} — ${event.startsAt.toDateString()}`,
      link: `/events/${event.slug}`,
      description: `${event.startsAt.toUTCString()} · ${event.venue}, ${[
        event.city,
        event.state,
      ]
        .filter(Boolean)
        .join(", ")} — ${event.description}`,
      publishedAt: event.createdAt,
      imageUrl: event.imageUrl,
      category: event.eventType ?? "Event",
    })),
  });
}
