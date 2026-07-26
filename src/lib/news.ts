import { db } from "@/lib/db";

export type ParsedNewsItem = {
  guid: string;
  title: string;
  summary: string;
  imageUrl: string | null;
  link: string;
  publishedAt: Date;
};

const DEFAULT_FEEDS = [
  { name: "The Hindu — Business", url: "https://www.thehindu.com/business/feeder/default.rss" },
  { name: "NDTV — India", url: "https://feeds.feedburner.com/ndtvnews-india-news" },
  { name: "Times of India — Top Stories", url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms" },
];

export async function ensureDefaultFeeds() {
  for (const feed of DEFAULT_FEEDS) {
    // eslint-disable-next-line no-await-in-loop
    await db.newsFeed.upsert({
      where: { url: feed.url },
      create: feed,
      update: { name: feed.name },
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
  const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  return match ? decode(match[1]) : null;
}

function attr(block: string, name: string, attribute: string) {
  const match = block.match(new RegExp(`<${name}\\b[^>]*\\b${attribute}="([^"]+)"`, "i"));
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
      tag(block, "description") ?? tag(block, "content:encoded") ?? tag(block, "summary") ?? "";
    const dateText =
      tag(block, "pubDate") ?? tag(block, "published") ?? tag(block, "updated") ?? "";
    const parsedDate = dateText ? new Date(dateText) : null;

    items.push({
      guid: tag(block, "guid") ?? link,
      title,
      summary: twoLineSummary(description || title),
      imageUrl: firstImage(block),
      link,
      publishedAt:
        parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : new Date(),
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
  const result = { feeds: feeds.length, fetched: 0, inserted: 0, skipped: 0, failed: [] as string[] };

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
        const existing = await db.newsItem.findUnique({ where: { guid: item.guid } });
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

  return result;
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
        { lastFetchedAt: { lt: new Date(Date.now() - maxAgeMinutes * 60 * 1000) } },
      ],
    },
    select: { id: true },
  });
  if (!stale) return null;

  return ingestNews();
}
