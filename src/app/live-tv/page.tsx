import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui";
import { LiveEmbedCard } from "@/components/LiveEmbedCard";
import { TV_CHANNELS, tvEmbedUrl } from "@/lib/liveMedia";
import { liveVideoId } from "@/lib/liveTv";

export const metadata: Metadata = {
  title: "Live desi TV — Hindi and English news channels | Godesi",
  description:
    "Watch live desi TV news: NDTV, Aaj Tak, ABP News, India Today and DD News, streamed through their official YouTube live channels.",
};

export const revalidate = 300;

export default async function LiveTvPage() {
  const channels = await Promise.all(
    TV_CHANNELS.map(async (channel) => ({
      channel,
      videoId: await liveVideoId(channel),
    })),
  );

  return (
    <div className="space-y-4">
      <Card className="border-rose-200 bg-gradient-to-br from-rose-50 via-white to-amber-50">
        <h1 className="text-2xl font-black sm:text-3xl">📺 Live desi TV</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-700">
          Hindi and English news channels, live from their official YouTube
          streams. Channels start muted — tap the sound icon in the player to
          listen.
        </p>
        <Link
          href="/live-radio"
          className="mt-3 inline-block text-sm font-bold text-rose-800 underline"
        >
          🎧 Listen to live radio instead →
        </Link>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {channels.map(({ channel, videoId }) => (
          <LiveEmbedCard
            key={channel.id}
            kind="tv"
            id={channel.id}
            name={channel.name}
            place={channel.place}
            src={tvEmbedUrl(channel, { videoId })}
          />
        ))}
      </div>

      <p className="text-xs text-slate-500">
        Every stream is the broadcaster&apos;s own YouTube live channel. Godesi
        does not host, record or re-stream any video.
      </p>
    </div>
  );
}
