import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
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
  /** ISO string (the cache stringifies Dates); empty when the feed gave no date. */
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

const FEED_MAX_BYTES = 2_000_000;
const FEED_MAX_REDIRECTS = 3;

function privateAddress(address: string) {
  const ip = address.toLowerCase().replace(/^::ffff:/, "");
  if (isIP(ip) === 4) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a >= 224
    );
  }
  return (
    ip === "::" ||
    ip === "::1" ||
    /^f[cd]/.test(ip) ||
    /^fe[89ab]/.test(ip)
  );
}

/** Every address the host resolves to must be public. */
async function publicHost(url: string) {
  try {
    const addresses = await lookup(new URL(url).hostname, { all: true });
    return (
      addresses.length > 0 &&
      addresses.every(({ address }) => !privateAddress(address))
    );
  } catch {
    return false;
  }
}

/** Follows redirects by hand so each hop is re-checked. */
async function fetchFeed(start: string) {
  let url: string | null = start;
  for (let hop = 0; url && hop <= FEED_MAX_REDIRECTS; hop++) {
    if (!(await publicHost(url))) return null;
    const response: Response = await fetch(url, {
      signal: AbortSignal.timeout(6000),
      headers: { "user-agent": "GodesiBot/1.0 (+https://godesi.com)" },
      cache: "no-store",
      redirect: "manual",
    });
    const location = response.headers.get("location");
    if (response.status >= 300 && response.status < 400 && location) {
      await response.body?.cancel();
      url = safeFeedUrl(new URL(location, url).toString());
      continue;
    }
    return response.ok ? { response, url } : null;
  }
  return null;
}

/** Stops reading once the cap is hit instead of buffering the whole body. */
async function readCapped(response: Response) {
  const reader = response.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let text = "";
  let bytes = 0;
  while (bytes < FEED_MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    text += decoder.decode(value, { stream: true });
  }
  await reader.cancel().catch(() => {});
  return text;
}

function absoluteLink(link: string, base: string) {
  try {
    const url = new URL(link, base);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

async function loadFeed(raw: string): Promise<BusinessFeedItem[]> {
  const start = safeFeedUrl(raw);
  if (!start) return [];
  try {
    const fetched = await fetchFeed(start);
    if (!fetched) return [];
    const xml = await readCapped(fetched.response);
    const items: BusinessFeedItem[] = [];
    // Undated posts keep feed order, after the dated ones.
    for (const item of parseFeed(xml).sort(
      (a, b) =>
        (b.dated ? b.publishedAt.getTime() : -Infinity) -
          (a.dated ? a.publishedAt.getTime() : -Infinity) || 0,
    )) {
      const link = absoluteLink(item.link, fetched.url);
      if (!link) continue;
      items.push({
        title: item.title,
        link,
        summary: item.summary,
        publishedAt: item.dated ? item.publishedAt.toISOString() : "",
      });
      if (items.length === BUSINESS_FEED_MAX) break;
    }
    return items;
  } catch {
    return [];
  }
}

/** Re-read hourly; the feed URL is part of the cache key. */
export const businessFeedItems = unstable_cache(loadFeed, ["business-feed"], {
  revalidate: 3600,
});
