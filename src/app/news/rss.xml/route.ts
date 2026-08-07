import { db } from "@/lib/db";
import { rssResponse } from "@/lib/rss";
import { NEWS_TOPICS, topicLabel, topicOf, topicSlug } from "@/lib/newsTopics";

export const dynamic = "force-dynamic";

/** Community news, optionally narrowed with `?topic=` or `?city=`. */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const wanted = params.get("topic")?.trim().toLowerCase();
  const topic = NEWS_TOPICS.some((row) => row.slug === wanted) ? wanted : null;
  const city = params.get("city")?.trim() || null;

  const items = await db.newsItem.findMany({
    where: {
      status: "PUBLISHED",
      ...(topic ? { topic } : {}),
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

  return rssResponse({
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
