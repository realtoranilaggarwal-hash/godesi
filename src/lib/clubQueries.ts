import { db } from "@/lib/db";
import type { ClubListItem } from "@/components/ClubCard";
import { clubIsPremium } from "@/lib/clubs";

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
    orderBy: [
      { premiumUntil: { sort: "desc", nulls: "last" } },
      { createdAt: "desc" },
    ],
    take: 60,
    select: {
      premiumUntil: true,
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
  const now = new Date();
  return rows
    .map(({ _count, events, premiumUntil, ...club }) => ({
      ...club,
      premium: clubIsPremium({ premiumUntil }, now),
      memberCount: _count.members,
      nextEvent: events[0] ?? null,
    }))
    .sort((a, b) => Number(b.premium) - Number(a.premium));
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
