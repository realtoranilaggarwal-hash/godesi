import { db } from "@/lib/db";
import { cachedFeed, rssXml } from "@/lib/rss";
import { NEWS_TOPICS, topicLabel, topicOf, topicSlug } from "@/lib/newsTopics";

export const dynamic = "force-dynamic";

/** Community news, optionally narrowed with `?topic=` or `?city=`. */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const wanted = params.get("topic")?.trim().toLowerCase();
  const topic = NEWS_TOPICS.some((row) => row.slug === wanted)
    ? (wanted ?? null)
    : null;
  const city = params.get("city")?.trim() || null;

  return cachedFeed(
    `news-${topic ?? "all"}-${city?.toLowerCase() ?? "all"}`,
    () => build(topic, city),
  );
}

async function build(topic: string | null, city: string | null) {
  // Older stories were filed before topics existed, so a filter also matches
  // the free-text category the reporter picked back then — same as /news.
  const topicWhere = topic
    ? {
        OR: [
          { topic },
          {
            category: {
              equals: NEWS_TOPICS.find((row) => row.slug === topic)?.label,
              mode: "insensitive" as const,
            },
          },
        ],
      }
    : {};

  const items = await db.newsItem.findMany({
    where: {
      status: "PUBLISHED",
      ...topicWhere,
      ...(city ? { city: { equals: city, mode: "insensitive" } } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: 50,
    select: {
      id: true,
      title: true,
      summary: true,
      imageUrl: true,
      publishedAt: true,
      topic: true,
      category: true,
      city: true,
    },
  });

  const scope = [topic ? topicLabel(topicSlug(topic)) : null, city]
    .filter(Boolean)
    .join(" in ");

  return rssXml({
    title: scope ? `Godesi news — ${scope}` : "Godesi news",
    description: scope
      ? `The newest ${scope} stories on Godesi, reported by members and gathered from trusted sources.`
      : "Community news for desi readers: member reports plus headlines from trusted sources, updated through the day.",
    path: "/news",
    items: items.map((item) => ({
      title: item.title,
      link: `/news/${item.id}`,
      description: item.city ? `${item.city} — ${item.summary}` : item.summary,
      publishedAt: item.publishedAt,
      imageUrl: item.imageUrl,
      category: topicLabel(topicOf(item)),
    })),
  });
}
