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

/** Two lines of summary, as the brief asks for. */
export function twoLineSummary(input: string, limit = 180) {
  const clean = decode(input);
  if (clean.length <= limit) return clean;
  return `${clean.slice(0, limit).replace(/\s+\S*$/, "")}…`;
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

    const description =
      tag(block, "description") ??
      tag(block, "content:encoded") ??
      tag(block, "summary") ??
      "";
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

  for (const feed of feeds) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const response = await fetch(feed.url, {
        headers: { "User-Agent": "GodesiNewsBot/1.0" },
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      // eslint-disable-next-line no-await-in-loop
      const xml = await response.text();
      const items = parseFeed(xml).slice(0, perFeed);
      result.fetched += items.length;

      for (const item of items) {
        // eslint-disable-next-line no-await-in-loop
        const existing = await db.newsItem.findUnique({
          where: { guid: item.guid },
        });
        if (existing) {
          result.skipped += 1;
          continue;
        }
        // eslint-disable-next-line no-await-in-loop
        await db.newsItem.create({
          data: {
            guid: item.guid,
            title: item.title,
            summary: item.summary,
            imageUrl: item.imageUrl,
            link: item.link,
            source: feed.name,
            topic: feed.topic,
            publishedAt: item.publishedAt,
            status: "PUBLISHED",
          },
        });
        result.inserted += 1;
      }

      // eslint-disable-next-line no-await-in-loop
      await db.newsFeed.update({
        where: { id: feed.id },
        data: { lastFetchedAt: new Date() },
      });
    } catch (error) {
      result.failed.push(`${feed.name}: ${(error as Error).message}`);
    }
  }

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
 * Keeps the news list fresh on Vercel Hobby, where scheduled crons may only run daily:
 * the first visitor after the staleness window triggers an ingest.
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
  user: Pick<User, "id" | "plan" | "planExpiresAt">,
) {
  const allowance = newsPostsPerWeek(user);
  const used = await db.newsItem.count({
    where: {
      submittedById: user.id,
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
  });
  return { allowance, used, left: Math.max(0, allowance - used) };
}
