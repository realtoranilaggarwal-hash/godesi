import { unstable_cache } from "next/cache";
import { parseFeed } from "@/lib/news";
import { effectivePlan } from "@/lib/plans";
import type { Plan } from "@prisma/client";

/** Featured cards show this many of their own latest posts. */
export const BUSINESS_FEED_MAX = 5;

export type BusinessFeedItem = {
  title: string;
  link: string;
  summary: string;
  /** ISO string: the cache stringifies Dates. */
  publishedAt: string;
};

type FeatureFields = {
  featured: boolean;
  featuredUntil: Date | null;
  owner?: { plan: Plan; planExpiresAt: Date | null } | null;
};

/** Paid placement (featured term still running) or an active Pro/Premium owner. */
export function businessCanShowFeed(business: FeatureFields) {
  const featured =
    business.featured &&
    (!business.featuredUntil || business.featuredUntil > new Date());
  return (
    featured ||
    (business.owner ? effectivePlan(business.owner) !== "FREE" : false)
  );
}

/** Public http(s) hosts only — the server fetches this URL. */
function safeFeedUrl(raw: string) {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    const host = url.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host.endsWith(".local") ||
      host.endsWith(".internal") ||
      /^[\d.]+$/.test(host) ||
      host.includes(":")
    )
      return null;
    return url.toString();
  } catch {
    return null;
  }
}

async function loadFeed(raw: string): Promise<BusinessFeedItem[]> {
  const url = safeFeedUrl(raw);
  if (!url) return [];
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(6000),
      headers: { "user-agent": "GodesiBot/1.0 (+https://godesi.com)" },
      cache: "no-store",
    });
    if (!response.ok) return [];
    const xml = (await response.text()).slice(0, 2_000_000);
    return parseFeed(xml)
      .filter((item) => /^https?:\/\//i.test(item.link))
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, BUSINESS_FEED_MAX)
      .map((item) => ({
        title: item.title,
        link: item.link,
        summary: item.summary,
        publishedAt: item.publishedAt.toISOString(),
      }));
  } catch {
    return [];
  }
}

/** Re-read hourly; the feed URL is part of the cache key. */
export const businessFeedItems = unstable_cache(loadFeed, ["business-feed"], {
  revalidate: 3600,
});
