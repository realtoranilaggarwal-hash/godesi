import type { TvChannel } from "@/lib/liveMedia";

type Cached = { videoId: string | null; at: number };

const CACHE_MS = 5 * 60 * 1000;
const cache = new Map<string, Cached>();

/**
 * Reads the current live video id off the channel's own /live page. Channels
 * switch streams through the day, so the id is refreshed every few minutes and
 * a miss simply falls back to the legacy channel embed.
 */
export async function liveVideoId(channel: TvChannel): Promise<string | null> {
  const hit = cache.get(channel.id);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.videoId;

  let videoId: string | null = null;
  try {
    const response = await fetch(
      `https://www.youtube.com/channel/${channel.youtubeChannelId}/live`,
      {
        headers: { "user-agent": "Mozilla/5.0 (compatible; GodesiBot/1.0)" },
        next: { revalidate: 300 },
      },
    );
    if (response.ok) {
      const html = await response.text();
      videoId =
        html.match(/"videoId":"([\w-]{11})"/)?.[1] ??
        html.match(/watch\?v=([\w-]{11})/)?.[1] ??
        null;
    }
  } catch {
    videoId = null;
  }

  cache.set(channel.id, { videoId, at: Date.now() });
  return videoId;
}
