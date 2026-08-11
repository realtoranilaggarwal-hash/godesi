import { db } from "@/lib/db";
import { cachedFeed, rssXml, type RssItem } from "@/lib/rss";
import { topicLabel, topicOf } from "@/lib/newsTopics";
import { newsPath } from "@/lib/newsLinks";

export const dynamic = "force-dynamic";

/** Everything new on Godesi in one feed: stories, events, blog posts, listings. */
export async function GET() {
  return cachedFeed("site", build);
}

async function build() {
  const [news, events, posts, listings, businesses] = await Promise.all([
    db.newsItem.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 25,
      select: {
        id: true,
        title: true,
        summary: true,
        imageUrl: true,
        publishedAt: true,
        topic: true,
        category: true,
      },
    }),
    db.event.findMany({
      where: { status: "APPROVED", startsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
      take: 15,
      select: {
        slug: true,
        title: true,
        description: true,
        imageUrl: true,
        createdAt: true,
        city: true,
        venue: true,
        startsAt: true,
      },
    }),
    db.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: 10,
      select: {
        slug: true,
        title: true,
        excerpt: true,
        body: true,
        coverUrl: true,
        publishedAt: true,
      },
    }),
    db.listing.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 15,
      select: {
        slug: true,
        title: true,
        description: true,
        city: true,
        createdAt: true,
        kind: true,
      },
    }),
    db.business.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 15,
      select: {
        slug: true,
        name: true,
        description: true,
        city: true,
        state: true,
        logoUrl: true,
        createdAt: true,
        categorySlug: true,
      },
    }),
  ]);

  const items: RssItem[] = [
    ...news.map((item) => ({
      title: item.title,
      link: newsPath(item),
      description: item.summary,
      publishedAt: item.publishedAt,
      imageUrl: item.imageUrl,
      category: topicLabel(topicOf(item)),
    })),
    ...events.map((event) => ({
      title: `${event.title} — ${event.startsAt.toDateString()}, ${event.city}`,
      link: `/events/${event.slug}`,
      description: `${event.venue}, ${event.city}. ${event.description}`,
      publishedAt: event.createdAt,
      imageUrl: event.imageUrl,
      category: "Events",
    })),
    ...posts.map((post) => ({
      title: post.title,
      link: `/blog/${post.slug}`,
      description: post.excerpt ?? post.body,
      publishedAt: post.publishedAt,
      imageUrl: post.coverUrl,
      category: "Blog",
    })),
    ...listings.map((listing) => ({
      title: `${listing.title} — ${listing.city}`,
      link: `/listings/${listing.slug}`,
      description: listing.description,
      publishedAt: listing.createdAt,
      category:
        listing.kind === "MARKETPLACE" ? "Buy & sell" : "Property & rooms",
    })),
    ...businesses.map((business) => ({
      title: business.name,
      link: `/b/${business.slug}`,
      description: [
        [business.city, business.state].filter(Boolean).join(", "),
        business.description ?? "",
      ]
        .filter(Boolean)
        .join(" — "),
      publishedAt: business.createdAt,
      imageUrl: business.logoUrl,
      category: "Businesses",
    })),
  ].sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  return rssXml({
    title: "Godesi — news, events, businesses and listings",
    description:
      "Everything new on Godesi: community news, events with tickets, new business cards, property, rooms and buy & sell listings.",
    path: "/feed.xml",
    items,
  });
}
