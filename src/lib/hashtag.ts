import { unstable_cache } from "next/cache";
import { parseFeed } from "@/lib/news";

export type HashtagHit = {
  source: "news" | "mastodon";
  author: string;
  title: string;
  link: string;
  /** ISO string, not a Date: the cache stringifies whatever it holds. */
  publishedAt: string;
  imageUrl: string | null;
};

/**
 * X charges for search and killed embeddable hashtag timelines, so the wall is
 * built from the two sources that are genuinely free and keyless: Google News
 * for headlines and Mastodon's public tag timeline for posts.
 */
const MASTODON_HOST = "mastodon.social";
const TIMEOUT = 6000;

/** Whatever the visitor typed, reduced to something both sources accept. */
export function cleanTag(input: string) {
  return input
    .replace(/[^0-9A-Za-z\u00C0-\u024F\u0900-\u097F\s#_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

/** Short "how old is this" label for a hit. */
export function hitAgo(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 60) return `${Math.max(minutes, 1)}m ago`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h ago`;
  return `${Math.round(minutes / 1440)}d ago`;
}

/** Mastodon tags are single words, so "india day" becomes "indiaday". */
function tagWord(input: string) {
  return cleanTag(input)
    .replace(/^#/, "")
    .replace(/[^0-9A-Za-z\u00C0-\u024F\u0900-\u097F_]/g, "");
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT),
    headers: { "user-agent": "GodesiBot/1.0 (+https://godesi.com)" },
    cache: "no-store",
  });
  if (!response.ok) return null;
  return response.text();
}

async function newsHits(query: string): Promise<HashtagHit[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(
    query,
  )}&hl=en-US&gl=US&ceid=US:en`;
  const xml = await fetchText(url).catch(() => null);
  if (!xml) return [];
  return parseFeed(xml).map((item) => ({
    source: "news" as const,
    // Google News titles end with " - Publisher".
    author: item.title.split(" - ").slice(-1)[0] ?? "Google News",
    title: item.title.replace(/ - [^-]+$/, ""),
    link: item.link,
    publishedAt: item.publishedAt.toISOString(),
    imageUrl: item.imageUrl ?? null,
  }));
}

type MastodonStatus = {
  url?: string;
  content?: string;
  created_at?: string;
  account?: { acct?: string; display_name?: string };
  media_attachments?: { preview_url?: string; type?: string }[];
};

function stripHtml(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

async function mastodonHits(tag: string): Promise<HashtagHit[]> {
  const word = tagWord(tag);
  if (!word) return [];
  const url = `https://${MASTODON_HOST}/api/v1/timelines/tag/${encodeURIComponent(
    word,
  )}?limit=20`;
  const body = await fetchText(url).catch(() => null);
  if (!body) return [];

  let statuses: MastodonStatus[];
  try {
    statuses = JSON.parse(body) as MastodonStatus[];
  } catch {
    return [];
  }
  if (!Array.isArray(statuses)) return [];

  return statuses
    .filter((status) => status.url && status.content)
    .map((status) => {
      const image = status.media_attachments?.find(
        (media) => media.type === "image" && media.preview_url,
      );
      return {
        source: "mastodon" as const,
        author: status.account?.display_name?.trim()
          ? `@${status.account.acct ?? ""}`
          : `@${status.account?.acct ?? "someone"}`,
        title: stripHtml(status.content ?? ""),
        link: status.url ?? "",
        publishedAt: new Date(status.created_at ?? Date.now()).toISOString(),
        imageUrl: image?.preview_url ?? null,
      };
    })
    .filter((hit) => hit.title.length > 2);
}

/**
 * Both sources are polled for the same tag by every visitor, so the merged list
 * is held for ten minutes; the page itself still renders per request.
 */
export const hashtagWall = unstable_cache(
  async (query: string) => {
    const clean = cleanTag(query);
    if (!clean) return [] as HashtagHit[];

    const [news, posts] = await Promise.all([
      newsHits(clean),
      mastodonHits(clean),
    ]);

    // Interleave so the wall never becomes one source's list.
    const merged: HashtagHit[] = [];
    for (let index = 0; index < Math.max(news.length, posts.length); index++) {
      if (news[index]) merged.push(news[index]);
      if (posts[index]) merged.push(posts[index]);
    }

    const seen = new Set<string>();
    const unique = merged.filter((hit) => {
      if (!hit.link || seen.has(hit.link)) return false;
      seen.add(hit.link);
      return true;
    });

    // "Trending" should read as now, but a quiet tag would otherwise show
    // nothing, so the cut-off only applies while there is enough left.
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const fresh = unique.filter(
      (hit) => new Date(hit.publishedAt).getTime() >= cutoff,
    );
    return (fresh.length >= 6 ? fresh : unique).slice(0, 24);
  },
  ["hashtag-wall"],
  { revalidate: 600 },
);
