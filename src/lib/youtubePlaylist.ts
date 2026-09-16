import { cachedQuery } from "@/lib/cache";

/**
 * A member pastes a public YouTube playlist link and every video in it shows on
 * their card. YouTube publishes an Atom feed per playlist (no API key, latest
 * 15 videos), which we read once a day; the videos stay on YouTube.
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

export function playlistPageUrl(id: string) {
  return `https://www.youtube.com/playlist?list=${id}`;
}

export type PlaylistVideo = { id: string; title: string; thumbnail: string };
export type PlaylistPreview = { title: string | null; videos: PlaylistVideo[] };

const ENTRY = /<entry>([\s\S]*?)<\/entry>/g;

async function readPlaylist(id: string): Promise<PlaylistPreview> {
  const response = await fetch(
    `https://www.youtube.com/feeds/videos.xml?playlist_id=${id}`,
    { signal: AbortSignal.timeout(8000) },
  );
  if (!response.ok) return { title: null, videos: [] };

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
  async (id: string): Promise<PlaylistPreview> => {
    try {
      return await readPlaylist(id);
    } catch {
      return { title: null, videos: [] };
    }
  },
);

/** Cached for a day; a playlist rarely changes minute to minute. */
export function playlistPreview(id: string) {
  return cachedPlaylist(id);
}
