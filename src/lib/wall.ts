import { db } from "@/lib/db";
import { CONTENT_TTL, cachedQuery } from "@/lib/cache";
import { optionalRead } from "@/lib/resilient";
import { SOCIAL_TAG, socialWallPosts } from "@/lib/social";
import { newsPath } from "@/lib/newsLinks";

export type WallItem = {
  id: string;
  kind: "member" | "business" | "listing" | "event" | "report" | "social";
  icon: string;
  /** Who or what the card is about. */
  title: string;
  text: string;
  href: string;
  /** Off-site links open in a new tab; Godesi pages route normally. */
  external: boolean;
  imageUrl: string | null;
  avatarUrl: string | null;
  at: Date;
};

const TAKE_PER_SOURCE = 8;

/**
 * The #godesi wall: real happenings on Godesi (new members, cards, listings,
 * events, member news reports) blended with the posts staff pinned from other
 * networks. Nothing is scraped — external cards are curated links.
 */
/**
 * The rail renders this on most pages and it reads six tables, so the result is
 * held for a minute. Dates survive the cache as strings, hence the revival.
 */
export async function wallItems(limit = 24): Promise<WallItem[]> {
  // The wall is a sidebar decoration: an unreachable database hides it.
  const rows = await optionalRead(() => cachedWall(limit), []);
  return rows.map((row) => ({ ...row, at: new Date(row.at) }));
}

const cachedWall = cachedQuery(
  "wall-items",
  CONTENT_TTL,
  async (limit: number) =>
    (await buildWallItems(limit)).map((item) => ({
      ...item,
      at: item.at.toISOString(),
    })),
);

async function buildWallItems(limit = 24): Promise<WallItem[]> {
  const [members, businesses, listings, events, reports, social] =
    await Promise.all([
      db.user.findMany({
        where: { username: { not: null } },
        orderBy: { createdAt: "desc" },
        take: TAKE_PER_SOURCE,
        select: {
          id: true,
          name: true,
          username: true,
          avatarUrl: true,
          location: true,
          headline: true,
          createdAt: true,
        },
      }),
      db.business.findMany({
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: TAKE_PER_SOURCE,
        select: {
          id: true,
          name: true,
          slug: true,
          city: true,
          category: true,
          logoUrl: true,
          createdAt: true,
        },
      }),
      db.listing.findMany({
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: TAKE_PER_SOURCE,
        select: {
          id: true,
          title: true,
          slug: true,
          city: true,
          kind: true,
          createdAt: true,
          images: { take: 1, select: { url: true } },
        },
      }),
      db.event.findMany({
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: TAKE_PER_SOURCE,
        select: {
          id: true,
          title: true,
          slug: true,
          city: true,
          startsAt: true,
          imageUrl: true,
          createdAt: true,
        },
      }),
      db.newsItem.findMany({
        where: { status: "PUBLISHED", submittedById: { not: null } },
        orderBy: { publishedAt: "desc" },
        take: TAKE_PER_SOURCE,
        select: {
          id: true,
          title: true,
          summary: true,
          city: true,
          category: true,
          imageUrl: true,
          publishedAt: true,
          submittedBy: { select: { name: true, avatarUrl: true } },
        },
      }),
      socialWallPosts(TAKE_PER_SOURCE),
    ]);

  const items: WallItem[] = [
    ...members.map((member) => ({
      id: `member:${member.id}`,
      kind: "member" as const,
      icon: "👋",
      title: member.name,
      text:
        member.headline ??
        `just joined Godesi${member.location ? ` from ${member.location}` : ""}`,
      href: `/${member.username}`,
      external: false,
      imageUrl: null,
      avatarUrl: member.avatarUrl,
      at: member.createdAt,
    })),
    ...businesses.map((business) => ({
      id: `business:${business.id}`,
      kind: "business" as const,
      icon: "🏪",
      title: business.name,
      text: `new ${business.category} card in ${business.city}`,
      href: `/b/${business.slug}`,
      external: false,
      imageUrl: null,
      avatarUrl: business.logoUrl,
      at: business.createdAt,
    })),
    ...listings.map((listing) => ({
      id: `listing:${listing.id}`,
      kind: "listing" as const,
      icon: "🏠",
      title: listing.title,
      text: `posted in ${listing.city}`,
      href: `/listings/${listing.slug}`,
      external: false,
      imageUrl: listing.images[0]?.url ?? null,
      avatarUrl: null,
      at: listing.createdAt,
    })),
    ...events.map((event) => ({
      id: `event:${event.id}`,
      kind: "event" as const,
      icon: "🎟️",
      title: event.title,
      text: `${event.city} · ${event.startsAt.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      })}`,
      href: `/events/${event.slug}`,
      external: false,
      imageUrl: event.imageUrl,
      avatarUrl: null,
      at: event.createdAt,
    })),
    ...reports.map((report) => ({
      id: `report:${report.id}`,
      kind: "report" as const,
      icon: "📰",
      title: report.title,
      text: `${[report.category, report.city].filter(Boolean).join(" · ") || "Local report"} — by ${
        report.submittedBy?.name ?? "a member"
      }`,
      href: newsPath(report),
      external: false,
      imageUrl: report.imageUrl,
      avatarUrl: report.submittedBy?.avatarUrl ?? null,
      at: report.publishedAt,
    })),
    ...social.map((post) => ({
      id: `social:${post.id}`,
      kind: "social" as const,
      icon: "💬",
      title: post.author,
      text: post.text,
      href: post.url,
      external: true,
      imageUrl: post.imageUrl,
      avatarUrl: post.avatarUrl,
      at: post.postedAt,
    })),
  ];

  return items.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, limit);
}

export const WALL_TAG = SOCIAL_TAG;
