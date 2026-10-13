/**
 * X's public oEmbed endpoint: no key, no cost. Given one tweet link it returns
 * the author and the tweet's text, which is all the wall needs to show it.
 */

const TWEET_URL =
  /^https:\/\/(?:www\.|mobile\.)?(?:x|twitter)\.com\/([A-Za-z0-9_]{1,15})\/status\/(\d+)(?:[/?#]|$)/i;

export type TweetDetails = {
  url: string;
  author: string;
  handle: string;
  text: string;
  postedAt: Date | null;
};

/** The canonical x.com link for a pasted tweet URL, or null if it is not one. */
export function tweetUrl(raw: string): string | null {
  const match = TWEET_URL.exec(raw.trim());
  return match ? `https://x.com/${match[1]}/status/${match[2]}` : null;
}

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  mdash: "—",
  ndash: "–",
  hellip: "…",
};

function decode(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&#x([0-9a-f]+);/gi, (_m, hex: string) =>
      String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_m, dec: string) =>
      String.fromCodePoint(Number(dec)),
    )
    .replace(/&([a-z]+);/gi, (match, name: string) => ENTITIES[name] ?? match)
    .trim();
}

/** Looks a tweet up on X; null when it is deleted, private or X is down. */
export async function fetchTweet(raw: string): Promise<TweetDetails | null> {
  const url = tweetUrl(raw);
  if (!url) return null;

  try {
    const response = await fetch(
      `https://publish.x.com/oembed?omit_script=1&dnt=true&url=${encodeURIComponent(url)}`,
      { cache: "no-store", signal: AbortSignal.timeout(8000) },
    );
    if (!response.ok) return null;
    const data = (await response.json()) as {
      author_name?: string;
      author_url?: string;
      html?: string;
    };
    if (!data.html) return null;

    const body = /<p[^>]*>([\s\S]*?)<\/p>/i.exec(data.html)?.[1] ?? "";
    const dateText = /<a[^>]*>([^<]+)<\/a>\s*<\/blockquote>/i.exec(
      data.html,
    )?.[1];
    const date = dateText ? new Date(dateText) : null;
    const handle = data.author_url?.split("/").filter(Boolean).pop();

    return {
      url,
      author: (data.author_name ?? "").trim() || `@${handle ?? "unknown"}`,
      handle: `@${handle ?? url.split("/")[3]}`,
      text: decode(body),
      postedAt: date && !Number.isNaN(date.getTime()) ? date : null,
    };
  } catch {
    return null;
  }
}
