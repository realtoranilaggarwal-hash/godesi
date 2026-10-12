import { cachedQuery } from "@/lib/cache";

/**
 * A member pastes a public YouTube playlist link and the playlist plays on
 * their card through YouTube's own playlist embed, which carries every video.
 * For the tile strip we read YouTube's Atom feed per playlist (no API key; it
 * lists the newest 15) once a day. Only successful reads are cached, so a
 * blocked or slow feed is retried on the next visit rather than kept for a day.
 */

const HOSTS = ["youtube.com", "m.youtube.com", "youtu.be", "music.youtube.com"];

export function playlistId(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:") return null;
    if (!HOSTS.includes(url.hostname.replace(/^www\./, "").toLowerCase()))
      return null;
    const id = url.searchParams.get("list");
    return id && /^[\w-]{10,}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function isPlaylistLink(url: string) {
  return playlistId(url) !== null;
}

const CHANNEL_PATH =
  /^\/(?:channel\/(UC[\w-]{22})|@[\w.-]+|c\/[\w.-]+|user\/[\w.-]+)(?:\/|$)/;

/**
 * A channel link becomes its "Uploads" playlist (channel id UC… → UU…), so
 * every video the channel posts shows without the member building a playlist.
 * @handle, /c/ and /user/ links are looked up on YouTube once, at save time.
 * Anything else comes back unchanged for the usual playlist check.
 */
export async function channelToPlaylistLink(raw: string): Promise<string> {
  const value = raw.trim();
  if (!value || playlistId(value)) return value;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return value;
  }
  if (!HOSTS.includes(url.hostname.replace(/^www\./, "").toLowerCase()))
    return value;
  const match = url.pathname.match(CHANNEL_PATH);
  if (!match) return value;

  let channelId: string | null = match[1] ?? null;
  if (!channelId) {
    try {
      const page = await fetch(`https://www.youtube.com${url.pathname}`, {
        headers: { "accept-language": "en" },
        signal: AbortSignal.timeout(8000),
      });
      const html = page.ok ? await page.text() : "";
      channelId =
        html.match(/"externalId":"(UC[\w-]{22})"/)?.[1] ??
        html.match(/youtube\.com\/channel\/(UC[\w-]{22})/)?.[1] ??
        null;
    } catch {
      return value;
    }
  }
  return channelId ? playlistPageUrl(`UU${channelId.slice(2)}`) : value;
}

/** Rewrites a pasted channel link in the form to its uploads playlist. */
export async function resolvePlaylistField(formData: FormData) {
  const raw = formData.get("playlistUrl");
  if (typeof raw === "string" && raw.trim()) {
    formData.set("playlistUrl", await channelToPlaylistLink(raw));
  }
}

export function playlistPageUrl(id: string) {
  return `https://www.youtube.com/playlist?list=${id}`;
}

/** Embed that plays the whole playlist, with YouTube's own list drawer. */
export function playlistEmbedUrl(id: string) {
  return `https://www.youtube-nocookie.com/embed/videoseries?list=${id}`;
}

/** How many videos the feed lists; the embed player still has all of them. */
export const FEED_LIMIT = 15;

export type PlaylistVideo = { id: string; title: string; thumbnail: string };
export type PlaylistPreview = { title: string | null; videos: PlaylistVideo[] };

const ENTRY = /<entry>([\s\S]*?)<\/entry>/g;

async function readPlaylist(id: string): Promise<PlaylistPreview> {
  const response = await fetch(
    `https://www.youtube.com/feeds/videos.xml?playlist_id=${id}`,
    { signal: AbortSignal.timeout(8000) },
  );
  if (!response.ok) throw new Error(`playlist feed ${response.status}`);

  const xml = await response.text();
  const title = xml.match(/<title>([^<]*)<\/title>/)?.[1] ?? null;

  const videos: PlaylistVideo[] = [];
  for (const [, entry] of Array.from(xml.matchAll(ENTRY))) {
    const videoId = entry.match(/<yt:videoId>([\w-]+)<\/yt:videoId>/)?.[1];
    if (!videoId) continue;
    videos.push({
      id: videoId,
      title: decodeEntities(entry.match(/<title>([^<]*)<\/title>/)?.[1] ?? ""),
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    });
  }

  return { title: title ? decodeEntities(title) : null, videos };
}

function decodeEntities(value: string) {
  return value
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

const cachedPlaylist = cachedQuery(
  "youtube-playlist",
  60 * 60 * 24,
  (id: string): Promise<PlaylistPreview> => readPlaylist(id),
);

/** Cached for a day on success; a failed read returns empty and is not cached. */
export async function playlistPreview(id: string): Promise<PlaylistPreview> {
  try {
    return await cachedPlaylist(id);
  } catch {
    return { title: null, videos: [] };
  }
}
