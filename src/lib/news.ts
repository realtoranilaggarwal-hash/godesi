import type { User } from "@prisma/client";
import { db } from "@/lib/db";
import { newsPostsPerWeek } from "@/lib/plans";

export type ParsedNewsItem = {
  guid: string;
  title: string;
  summary: string;
  imageUrl: string | null;
  link: string;
  publishedAt: Date;
};

const DEFAULT_FEEDS: { name: string; url: string; topic?: string }[] = [
  {
    name: "Times of India — Top Stories",
    url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
  },
  {
    name: "NDTV — India",
    url: "https://feeds.feedburner.com/ndtvnews-india-news",
  },
  {
    name: "Economic Times — Top Stories",
    url: "https://economictimes.indiatimes.com/rssfeedstopstories.cms",
  },
  {
    name: "Fibre2Fashion",
    url: "https://www.fibre2fashion.com/rss/textile-news.xml",
  },
  { name: "Apparel Resources", url: "https://apparelresources.com/feed/" },
  {
    name: "The Hindu — Business",
    url: "https://www.thehindu.com/business/feeder/default.rss",
  },
  {
    name: "Times of India — Astrology & Spirituality",
    url: "https://timesofindia.indiatimes.com/rssfeeds/2886704.cms",
    topic: "faith",
  },
  {
    name: "The Hindu — Faith",
    url: "https://www.thehindu.com/society/faith/feeder/default.rss",
    topic: "faith",
  },
  {
    name: "Speaking Tree",
    url: "https://www.speakingtree.in/rss/articles.cms",
    topic: "faith",
  },
];

export async function ensureDefaultFeeds() {
  for (const feed of DEFAULT_FEEDS) {
    // eslint-disable-next-line no-await-in-loop
    await db.newsFeed.upsert({
      where: { url: feed.url },
      create: { ...feed, topic: feed.topic ?? "general" },
      update: { name: feed.name, topic: feed.topic ?? "general" },
    });
  }
}

function decode(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function tag(block: string, name: string) {
  const match = block.match(
    new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"),
  );
  return match ? decode(match[1]) : null;
}

function attr(block: string, name: string, attribute: string) {
  const match = block.match(
    new RegExp(`<${name}\\b[^>]*\\b${attribute}="([^"]+)"`, "i"),
  );
  return match ? match[1] : null;
}

/** Trimmed summary: a couple of lines on cards, a few paragraphs on the story. */
export function twoLineSummary(input: string, limit = 700) {
  const clean = decode(input);
  if (clean.length <= limit) return clean;
  return `${clean.slice(0, limit).replace(/\s+\S*$/, "")}…`;
}

/**
 * A member's own report is published in full on Godesi — there is no publisher
 * to send the reader to, so trimming it would lose the story.
 */
export function memberStory(input: string) {
  return decode(input).trim();
}

function firstImage(block: string) {
  return (
    attr(block, "media:content", "url") ??
    attr(block, "media:thumbnail", "url") ??
    attr(block, "enclosure", "url") ??
    block.match(/<img[^>]+src="([^"]+)"/i)?.[1] ??
    null
  );
}

/** Minimal RSS 2.0 + Atom parser — enough for headline/image/summary ingestion. */
export function parseFeed(xml: string): ParsedNewsItem[] {
  const blocks = [
    ...(xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? []),
    ...(xml.match(/<entry\b[\s\S]*?<\/entry>/gi) ?? []),
  ];

  const items: ParsedNewsItem[] = [];

  for (const block of blocks) {
    const title = tag(block, "title");
    const link = tag(block, "link") || attr(block, "link", "href");
    if (!title || !link) continue;

    const encoded = tag(block, "content:encoded");
    const brief = tag(block, "description") ?? tag(block, "summary");
    const description =
      encoded && encoded.length > (brief?.length ?? 0) ? encoded : brief ?? "";
    const dateText =
      tag(block, "pubDate") ??
      tag(block, "published") ??
      tag(block, "updated") ??
      "";
    const parsedDate = dateText ? new Date(dateText) : null;

    items.push({
      guid: tag(block, "guid") ?? link,
      title,
      summary: twoLineSummary(description || title),
      imageUrl: firstImage(block),
      link,
      publishedAt:
        parsedDate && !Number.isNaN(parsedDate.getTime())
          ? parsedDate
          : new Date(),
    });
  }

  return items;
}

/**
 * Pulls every active feed and stores new items only. Duplicates are rejected by the
 * unique `guid`, so re-running the cron is harmless.
 */
export async function ingestNews({ perFeed = 12 }: { perFeed?: number } = {}) {
  const feeds = await db.newsFeed.findMany({ where: { active: true } });
  const result = {
    feeds: feeds.length,
    fetched: 0,
    inserted: 0,
    skipped: 0,
    failed: [] as string[],
  };

  // Feeds are fetched together and written with one insert per feed: one at a
  // time took long enough that the crawl outlived the function's time budget.
  await Promise.all(
    feeds.map(async (feed) => {
      try {
        const response = await fetch(feed.url, {
          headers: { "User-Agent": "GodesiNewsBot/1.0" },
          cache: "no-store",
          signal: AbortSignal.timeout(8000),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const xml = await response.text();
        const items = parseFeed(xml).slice(0, perFeed);
        result.fetched += items.length;

        const known = await db.newsItem.findMany({
          where: { guid: { in: items.map((item) => item.guid) } },
          select: { guid: true },
        });
        const seen = new Set(known.map((row) => row.guid));
        const fresh = items.filter((item) => !seen.has(item.guid));
        result.skipped += items.length - fresh.length;

        if (fresh.length) {
          const { count } = await db.newsItem.createMany({
            data: fresh.map((item) => ({
              guid: item.guid,
              title: item.title,
              summary: item.summary,
              imageUrl: item.imageUrl,
              link: item.link,
              source: feed.name,
              topic: feed.topic,
              publishedAt: item.publishedAt,
              status: "PUBLISHED" as const,
            })),
            skipDuplicates: true,
          });
          result.inserted += count;
        }

        await db.newsFeed.update({
          where: { id: feed.id },
          data: { lastFetchedAt: new Date() },
        });
      } catch (error) {
        result.failed.push(`${feed.name}: ${(error as Error).message}`);
      }
    }),
  );

  const purged = await purgeOldNews();

  return { ...result, purged };
}

/** News is a rolling window: anything older than six days drops off the site. */
export const NEWS_MAX_AGE_DAYS = 6;

export function freshNewsCutoff() {
  return new Date(Date.now() - NEWS_MAX_AGE_DAYS * 24 * 60 * 60 * 1000);
}

export async function purgeOldNews() {
  const { count } = await db.newsItem.deleteMany({
    where: { publishedAt: { lt: freshNewsCutoff() } },
  });
  return count;
}

/**
 * Crawls only when the oldest feed has passed the staleness window. Called by
 * the half-hourly cron — never from a page, since a visitor should not wait for
 * nine publishers to answer.
 */
export async function ingestIfStale(maxAgeMinutes = 30) {
  await ensureDefaultFeeds();

  const stale = await db.newsFeed.findFirst({
    where: {
      active: true,
      OR: [
        { lastFetchedAt: null },
        {
          lastFetchedAt: {
            lt: new Date(Date.now() - maxAgeMinutes * 60 * 1000),
          },
        },
      ],
    },
    select: { id: true },
  });
  if (!stale) return null;

  return ingestNews();
}

/**
 * How many more stories a member may file this week. Free members get one a
 * week so the feed stays curated; paid plans get a journalist's allowance.
 */
export async function newsQuotaLeft(
  user: Pick<User, "id" | "plan" | "planExpiresAt" | "foundingNumber">,
) {
  const allowance = newsPostsPerWeek(user);
  if (!Number.isFinite(allowance)) {
    return { allowance, used: 0, left: allowance, unlimited: true };
  }
  const used = await db.newsItem.count({
    where: {
      submittedById: user.id,
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
  });
  return {
    allowance,
    used,
    left: Math.max(0, allowance - used),
    unlimited: false,
  };
}
