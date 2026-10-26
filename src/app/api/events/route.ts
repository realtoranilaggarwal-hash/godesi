import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eventJson, FEED_HEADERS } from "@/lib/publicEvents";
import { eventMatchesTopic, isEventTopic } from "@/lib/eventTopics";

export const dynamic = "force-dynamic";

/**
 * Public read-only event list for Godesi's own event marketing sites
 * (eventringer.com). Unlike /api/feed this returns the whole record so a
 * satellite can render a full, indexable page of its own; ticket sales still
 * happen on godesi.com through the `ticketUrl` on every item.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const limit = Math.min(
    Math.max(Number(params.get("limit") ?? 48) || 48, 1),
    200,
  );
  const skip = Math.max(Number(params.get("offset") ?? 0) || 0, 0);
  const city = params.get("city")?.trim() || undefined;
  const state = params.get("state")?.trim() || undefined;
  const eventType = params.get("type")?.trim() || undefined;
  const query = params.get("q")?.trim() || undefined;
  const ref = params.get("ref")?.trim() || undefined;
  const rawTopic = params.get("topic")?.trim() ?? "";
  if (rawTopic && !isEventTopic(rawTopic)) {
    return NextResponse.json({ error: "Unknown topic" }, { status: 400 });
  }
  const topic = isEventTopic(rawTopic) ? rawTopic : null;
  const hostFilter = await hostWhere(params.get("host"));
  if (hostFilter === null) {
    return NextResponse.json({ total: 0, items: [] }, { headers: FEED_HEADERS });
  }

  const where = {
    AND: [hostFilter],
    status: "APPROVED" as const,
    startsAt: { gte: new Date() },
    ...(city ? { city: { equals: city, mode: "insensitive" as const } } : {}),
    ...(state ? { state: { equals: state, mode: "insensitive" as const } } : {}),
    ...(eventType ? { eventType: { in: eventType.split(",") } } : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" as const } },
            { description: { contains: query, mode: "insensitive" as const } },
            { venue: { contains: query, mode: "insensitive" as const } },
            { city: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const found = await db.event.findMany({
    where,
    orderBy: { startsAt: "asc" },
    // Topic matching runs on the text, so scan the host's whole (small) list.
    take: topic ? 200 : limit,
    skip: topic ? 0 : skip,
    include: {
      speakers: { orderBy: { sortOrder: "asc" } },
      sessions: { orderBy: { sortOrder: "asc" } },
      tiers: { orderBy: { sortOrder: "asc" } },
      organizer: { select: { name: true } },
      business: { select: { name: true, slug: true } },
    },
  });

  const matched = topic
    ? found.filter((event) => eventMatchesTopic(event, topic))
    : found;
  const events = topic ? matched.slice(skip, skip + limit) : matched;
  const facets = params.get("facets") === "1";

  return NextResponse.json(
    {
      total: topic ? matched.length : await db.event.count({ where }),
      items: events.map((event) => eventJson(event, ref)),
      ...(facets ? await buildFacets() : {}),
    },
    { headers: FEED_HEADERS },
  );
}

/**
 * `host=<card slug>` limits the list to events run by that card: events linked
 * to the card plus any event its owner organises. Returns null for an unknown
 * card so the caller answers with an empty list.
 */
async function hostWhere(raw: string | null) {
  const slug = raw?.trim().toLowerCase() ?? "";
  if (!slug) return {};
  if (slug.length > 120 || !/^[a-z0-9-]+$/.test(slug)) return null;
  const business = await db.business.findFirst({
    where: { OR: [{ slug }, { previousSlugs: { has: slug } }] },
    select: { id: true, ownerId: true },
  });
  if (!business) return null;
  return {
    OR: [
      { businessId: business.id },
      ...(business.ownerId ? [{ organizerId: business.ownerId }] : []),
    ],
  };
}

/** City and type counts, so a satellite can build its own landing pages. */
async function buildFacets() {
  const where = {
    status: "APPROVED" as const,
    startsAt: { gte: new Date() },
  };

  const [cities, types] = await Promise.all([
    db.event.groupBy({
      by: ["city", "state"],
      where,
      _count: { _all: true },
      orderBy: { _count: { city: "desc" } },
      take: 100,
    }),
    db.event.groupBy({
      by: ["eventType"],
      where,
      _count: { _all: true },
      orderBy: { _count: { eventType: "desc" } },
      take: 60,
    }),
  ]);

  return {
    cities: cities.map((row) => ({
      city: row.city,
      state: row.state,
      count: row._count._all,
    })),
    types: types
      .filter((row) => row.eventType)
      .map((row) => ({ type: row.eventType as string, count: row._count._all })),
  };
}
