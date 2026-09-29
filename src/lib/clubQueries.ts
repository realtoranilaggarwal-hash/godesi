import { db } from "@/lib/db";
import type { ClubListItem } from "@/components/ClubCard";

/** Clubs for the directory: every club is listed, private ones by name only. */
export async function listClubs(filter: {
  category?: string;
  city?: string;
  q?: string;
}): Promise<ClubListItem[]> {
  const q = filter.q?.trim();
  const rows = await db.club.findMany({
    where: {
      ...(filter.category ? { category: filter.category } : {}),
      ...(filter.city
        ? { city: { equals: filter.city, mode: "insensitive" } }
        : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
              { city: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 60,
    select: {
      slug: true,
      name: true,
      description: true,
      imageUrl: true,
      category: true,
      city: true,
      state: true,
      online: true,
      visibility: true,
      _count: { select: { members: { where: { status: "ACTIVE" } } } },
      events: {
        where: { status: "APPROVED", startsAt: { gte: new Date() } },
        orderBy: { startsAt: "asc" },
        take: 1,
        select: { slug: true, title: true, startsAt: true },
      },
    },
  });
  return rows.map(({ _count, events, ...club }) => ({
    ...club,
    memberCount: _count.members,
    nextEvent: events[0] ?? null,
  }));
}

/** Clubs where this member is an active organiser — the ones they can post events for. */
export async function organizerClubs(userId: string) {
  return db.club.findMany({
    where: {
      members: { some: { userId, role: "ORGANIZER", status: "ACTIVE" } },
    },
    orderBy: { name: "asc" },
    select: { id: true, slug: true, name: true },
  });
}
