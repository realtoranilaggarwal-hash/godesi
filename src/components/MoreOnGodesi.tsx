import Link from "next/link";
import type { ReactNode } from "react";
import { db } from "@/lib/db";
import { searchBusinesses } from "@/lib/businesses";
import { freshNewsCutoff } from "@/lib/news";
import { socialWallPosts } from "@/lib/socialQueries";
import { SOCIAL_TAG } from "@/lib/social";
import { citySlug } from "@/lib/citySlug";
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
 * Fills the foot of a short page with more of Godesi: similar businesses
 * (same city first, then state, then country), related searches, upcoming
 * events, members' local news and #godesi posts from X. Everything links
 * inside Godesi; publisher headlines stay on /news. Every block hides itself
 * when it has nothing to show.
 */
export async function MoreOnGodesi({
  categorySlug = null,
  categoryName = null,
  city = null,
  state = null,
  country = null,
  excludeBusinessId = null,
}: {
  categorySlug?: string | null;
  categoryName?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
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
      where: {
        status: "PUBLISHED",
        link: { startsWith: "/" },
        publishedAt: { gte: freshNewsCutoff() },
      },
      orderBy: { publishedAt: "desc" },
      take: 12,
    }),
    socialWallPosts(12),
  ]);

  const same = (a?: string | null, b?: string | null) =>
    Boolean(a && b) && a!.trim().toLowerCase() === b!.trim().toLowerCase();
  const nearness = (place: {
    city?: string | null;
    state?: string | null;
    country?: string | null;
  }) =>
    same(place.city, city)
      ? 3
      : same(place.state, state)
        ? 2
        : same(place.country, country)
          ? 1
          : 0;
  const similar = businesses
    .filter((business) => business.id !== excludeBusinessId)
    .sort((a, b) => nearness(b) - nearness(a))
    .slice(0, 4);
  const localNews = [...news]
    .sort((a, b) => nearness(b) - nearness(a))
    .slice(0, 4);
  const searches =
    categorySlug && categoryName
      ? (
          [
            ["city", city],
            ["state", state],
            ["country", country],
          ] as const
        ).flatMap(([key, place]) =>
          place
            ? [
                {
                  label: `${categoryName} in ${place}`,
                  href: `/search?${new URLSearchParams({ category: categorySlug, [key]: place })}`,
                },
              ]
            : [],
        )
      : [];
  const tweets = posts.filter((post) => post.platform === "X").slice(0, 2);

  if (
    !similar.length &&
    !events.length &&
    !localNews.length &&
    !tweets.length
  ) {
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

      {searches.length || city ? (
        <nav aria-label="Related searches" className="flex flex-wrap gap-2">
          {city ? (
            <Link
              href={`/city/${citySlug(city)}`}
              className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 hover:bg-orange-100"
            >
              🏙️ Explore {city} on GoDesi
            </Link>
          ) : null}
          {searches.map((search) => (
            <Link
              key={search.href}
              href={search.href}
              className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
            >
              🔎 {search.label}
            </Link>
          ))}
        </nav>
      ) : null}

      {events.length ? (
        <Block title="Upcoming events 🎉" href="/events">
          {events.map((event) => (
            <EventCard key={event.id} event={event} variant="compact" />
          ))}
        </Block>
      ) : null}

      {localNews.length ? (
        <Block title="Local news from members 📰" href="/news">
          {localNews.map((item) => (
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
