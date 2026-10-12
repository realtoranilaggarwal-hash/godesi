import { db } from "@/lib/db";
import { properName } from "@/lib/names";

export type RecentBanner = {
  key: string;
  href: string;
  /** Photo or logo; falls back to `icon`. */
  imageUrl: string | null;
  icon: string;
  title: string;
  /** "Joined", "New listing", "Posted a story", "Posted an event", "New club". */
  verb: string;
  line: string | null;
  at: Date;
};

/**
 * Everything members did lately — joined, listed a business, posted a story,
 * an event or a club — merged newest-first for the home-page strip, so a
 * member who posted something can spot themselves scrolling past.
 */
export async function recentActivity(take = 30): Promise<RecentBanner[]> {
  const each = Math.ceil(take / 2);
  const [members, businesses, stories, events, clubs] = await Promise.all([
    db.user.findMany({
      where: {
        emailVerifiedAt: { not: null },
        bannedAt: null,
        username: { not: null },
      },
      orderBy: { createdAt: "desc" },
      take: each,
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true,
        headline: true,
        location: true,
        createdAt: true,
      },
    }),
    db.business.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: each,
      select: {
        id: true,
        slug: true,
        name: true,
        city: true,
        logoUrl: true,
        createdAt: true,
        media: {
          where: { type: "IMAGE" },
          orderBy: { sortOrder: "asc" },
          take: 1,
          select: { url: true },
        },
        subcategoryRef: { select: { name: true, icon: true } },
        categoryRef: { select: { icon: true } },
      },
    }),
    db.newsItem.findMany({
      where: {
        status: "PUBLISHED",
        submittedById: { not: null },
        anonymous: false,
      },
      orderBy: { publishedAt: "desc" },
      take: each,
      select: {
        id: true,
        title: true,
        imageUrl: true,
        photoUrls: true,
        city: true,
        publishedAt: true,
        submittedBy: { select: { name: true } },
      },
    }),
    db.event.findMany({
      where: { status: "APPROVED", startsAt: { gte: new Date() } },
      orderBy: { createdAt: "desc" },
      take: each,
      select: {
        id: true,
        slug: true,
        title: true,
        city: true,
        imageUrl: true,
        createdAt: true,
      },
    }),
    db.club.findMany({
      where: { visibility: "PUBLIC" },
      orderBy: { createdAt: "desc" },
      take: each,
      select: {
        id: true,
        slug: true,
        name: true,
        city: true,
        imageUrl: true,
        createdAt: true,
      },
    }),
  ]);

  const lanes: RecentBanner[][] = [
    members.map((m) => ({
      key: `u-${m.id}`,
      href: `/${m.username}`,
      imageUrl: m.avatarUrl,
      icon: "👋",
      title: properName(m.name),
      verb: "Joined GoDesi",
      line: m.headline ?? m.location,
      at: m.createdAt,
    })),
    businesses.map((b) => ({
      key: `b-${b.id}`,
      href: `/b/${b.slug}`,
      imageUrl: b.logoUrl ?? b.media[0]?.url ?? null,
      icon: b.subcategoryRef?.icon || b.categoryRef?.icon || "🏷️",
      title: b.name,
      verb: "New listing",
      line:
        [b.subcategoryRef?.name, b.city].filter(Boolean).join(" · ") || null,
      at: b.createdAt,
    })),
    stories.map((s) => ({
      key: `n-${s.id}`,
      href: `/news/${s.id}`,
      imageUrl: s.imageUrl ?? s.photoUrls[0] ?? null,
      icon: "📰",
      title: s.title,
      verb: s.submittedBy
        ? `${properName(s.submittedBy.name)} posted`
        : "New story",
      line: s.city,
      at: s.publishedAt,
    })),
    events.map((e) => ({
      key: `e-${e.id}`,
      href: `/events/${e.slug}`,
      imageUrl: e.imageUrl,
      icon: "🎟️",
      title: e.title,
      verb: "New event",
      line: e.city,
      at: e.createdAt,
    })),
    clubs.map((c) => ({
      key: `c-${c.id}`,
      href: `/clubs/${c.slug}`,
      imageUrl: c.imageUrl,
      icon: "🎤",
      title: c.name,
      verb: "New club",
      line: c.city,
      at: c.createdAt,
    })),
  ];

  // Round-robin across the kinds so a lone story or event is not buried
  // under the steady flow of sign-ups.
  const merged: RecentBanner[] = [];
  for (let i = 0; merged.length < take; i++) {
    const before = merged.length;
    for (const lane of lanes) if (lane[i]) merged.push(lane[i]);
    if (merged.length === before) break;
  }
  return merged.slice(0, take);
}
