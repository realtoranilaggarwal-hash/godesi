import Link from "next/link";
import type { ReactNode } from "react";
import { db } from "@/lib/db";
import { searchBusinesses } from "@/lib/businesses";
import { freshNewsCutoff } from "@/lib/news";
import { socialWallPosts } from "@/lib/socialQueries";
import { SOCIAL_TAG } from "@/lib/social";
import { BusinessTile } from "@/components/BusinessTile";
import { EventCard } from "@/components/EventCard";
import { NewsCard } from "@/components/NewsCard";
import { TweetEmbed } from "@/components/TweetEmbed";

function Block({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <Link
          href={href}
          className="text-xs font-bold text-indigo-600 hover:underline"
        >
          See all →
        </Link>
      </div>
      <div className="grid items-start gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}

/**
 * Fills the foot of a short page with more of Godesi: similar businesses,
 * upcoming events, fresh news and #godesi posts from X. Every block hides
 * itself when it has nothing to show.
 */
export async function MoreOnGodesi({
  categorySlug = null,
  categoryName = null,
  city = null,
  excludeBusinessId = null,
}: {
  categorySlug?: string | null;
  categoryName?: string | null;
  city?: string | null;
  excludeBusinessId?: string | null;
}) {
  const [businesses, events, news, posts] = await Promise.all([
    categorySlug
      ? searchBusinesses({ categorySlugs: [categorySlug], take: 24 })
      : searchBusinesses({ take: 8, sort: "recent" }),
    db.event.findMany({
      where: { status: "APPROVED", startsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
      take: 4,
      include: {
        category: { select: { name: true, icon: true, color: true } },
        tiers: { select: { price: true } },
      },
    }),
    db.newsItem.findMany({
      where: { status: "PUBLISHED", publishedAt: { gte: freshNewsCutoff() } },
      orderBy: { publishedAt: "desc" },
      take: 4,
    }),
    socialWallPosts(12),
  ]);

  const sameCity = (name: string) =>
    Boolean(city) && name.toLowerCase() === city?.toLowerCase();
  const similar = businesses
    .filter((business) => business.id !== excludeBusinessId)
    .sort((a, b) => Number(sameCity(b.city)) - Number(sameCity(a.city)))
    .slice(0, 4);
  const tweets = posts.filter((post) => post.platform === "X").slice(0, 2);

  if (!similar.length && !events.length && !news.length && !tweets.length) {
    return null;
  }

  return (
    <div className="space-y-6">
      {similar.length ? (
        <Block
          title={
            categoryName
              ? `More ${categoryName}${city ? ` near ${city}` : ""}`
              : "New on GoDesi"
          }
          href={categorySlug ? `/categories/${categorySlug}` : "/categories"}
        >
          {similar.map((business) => (
            <BusinessTile key={business.id} business={business} />
          ))}
        </Block>
      ) : null}

      {events.length ? (
        <Block title="Upcoming events 🎉" href="/events">
          {events.map((event) => (
            <EventCard key={event.id} event={event} variant="compact" />
          ))}
        </Block>
      ) : null}

      {news.length ? (
        <Block title="Latest news 📰" href="/news">
          {news.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </Block>
      ) : null}

      {tweets.length ? (
        <Block title={`#${SOCIAL_TAG} on X`} href="/buzz">
          {tweets.map((post) => (
            <TweetEmbed
              key={post.id}
              url={post.url}
              author={post.author}
              handle={post.handle}
              text={post.text}
            />
          ))}
        </Block>
      ) : null}
    </div>
  );
}
