import type { TvChannel } from "@/lib/liveMedia";

type Cached = { videoId: string | null; at: number };

const CACHE_MS = 5 * 60 * 1000;
const cache = new Map<string, Cached>();

/**
 * YouTube answers datacentre IPs with a consent wall unless these are sent, and
 * that wall carries its own promo videoId — which is how several channels ended
 * up showing the same unrelated clip.
 */
const HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "accept-language": "en-US,en;q=0.9",
  cookie: "SOCS=CAI; CONSENT=YES+1",
} as const;

/**
 * Reads the current live video id off the channel's own /live page. Channels
 * switch streams through the day, so the id is refreshed every few minutes;
 * anything that is not a confirmed live stream for that very channel resolves
 * to null so the page can say "off air" instead of embedding a dead player.
 */
export async function liveVideoId(channel: TvChannel): Promise<string | null> {
  const hit = cache.get(channel.id);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.videoId;

  let videoId: string | null = null;
  try {
    const response = await fetch(
      `https://www.youtube.com/channel/${channel.youtubeChannelId}/live?hl=en`,
      { headers: HEADERS, next: { revalidate: 300 } },
    );
    if (response.ok) {
      const html = await response.text();
      const live =
        html.includes('"isLiveNow":true') ||
        html.includes('"isLive":true') ||
        html.includes("hlsManifestUrl");
      // The page must belong to this channel, or we are looking at a consent
      // or error page whose videoId has nothing to do with the broadcaster.
      const mine = html.includes(channel.youtubeChannelId);
      if (live && mine) {
        videoId =
          html.match(/"videoId":"([\w-]{11})"/)?.[1] ??
          html.match(/watch\?v=([\w-]{11})/)?.[1] ??
          null;
      }
    }
  } catch {
    videoId = null;
  }

  cache.set(channel.id, { videoId, at: Date.now() });
  return videoId;
}

/**
 * Resolves every channel at once and drops repeats: if two channels answer with
 * the same video, only the first keeps it — the rest are treated as off air.
 */
export async function liveVideoIds(channels: TvChannel[]) {
  const resolved = await Promise.all(
    channels.map(
      async (channel) => [channel.id, await liveVideoId(channel)] as const,
    ),
  );

  const seen = new Set<string>();
  const unique = new Map<string, string | null>();
  for (const [id, videoId] of resolved) {
    if (!videoId || seen.has(videoId)) {
      unique.set(id, null);
      continue;
    }
    seen.add(videoId);
    unique.set(id, videoId);
  }
  return unique;
}
