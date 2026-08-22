import { cachedQuery } from "@/lib/cache";

/**
 * Sellers have far more photos than their plan lets them upload, so they can
 * paste a public Google Photos album link instead. We read the album's public
 * page once a day and keep only the photo URLs — the pictures are served by
 * Google, so nothing lands on Godesi storage.
 */

const HOSTS = ["photos.app.goo.gl", "photos.google.com"];

export function isAlbumLink(url: string) {
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== "https:") return false;
    return HOSTS.includes(parsed.hostname);
  } catch {
    return false;
  }
}

export function normaliseAlbumLink(url: string) {
  const clean = url.trim();
  return isAlbumLink(clean) ? clean : null;
}

/** Google serves any size from the same base URL by appending =w<width>-h<height>. */
export function albumThumb(url: string, width = 400, height = 400) {
  return `${url}=w${width}-h${height}-c`;
}

const PHOTO = /https:\/\/lh3\.googleusercontent\.com\/pw\/[A-Za-z0-9_-]{40,}/g;

/**
 * A browser user agent gets the goo.gl interstitial instead of a redirect, so
 * we announce ourselves as a bot and follow the 302 to photos.google.com/share.
 */
const AGENT = "Mozilla/5.0 (compatible; GodesiBot/1.0; +https://godesi.com)";

async function readAlbum(url: string): Promise<AlbumPreview> {
  const response = await fetch(url, {
    headers: { "User-Agent": AGENT, "Accept-Language": "en-US,en;q=0.9" },
    redirect: "follow",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) return { images: [], title: null };

  const html = await response.text();
  const title = html.match(
    /<meta property="og:title" content="([^"]*)"/,
  )?.[1];

  const images: string[] = [];
  for (const match of html.match(PHOTO) ?? []) {
    if (!images.includes(match)) images.push(match);
    if (images.length >= 36) break;
  }

  return {
    images,
    // Google appends "· Saturday, Aug 4 📸" to the album name.
    title: title ? decodeEntities(title).split(" · ")[0] : null,
  };
}

function decodeEntities(value: string) {
  return value
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

export type AlbumPreview = { images: string[]; title: string | null };

const cachedAlbum = cachedQuery(
  "google-album",
  60 * 60 * 24,
  async (url: string): Promise<AlbumPreview> => {
    try {
      return await readAlbum(url);
    } catch {
      return { images: [], title: null };
    }
  },
);

/** Cached for a day; an album's photos rarely change minute to minute. */
export function albumPreview(url: string) {
  return cachedAlbum(url);
}
