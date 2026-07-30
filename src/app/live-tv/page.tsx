import type { Metadata } from "next";
import Link from "next/link";
import { Card, LinkButton } from "@/components/ui";
import { LiveEmbedCard } from "@/components/LiveEmbedCard";
import { TV_CHANNELS } from "@/lib/liveMedia";
import { liveVideoId } from "@/lib/liveTv";
import { tvEntries, LIVE_CHANNEL_MONTHLY_USD } from "@/lib/liveChannels";

export const metadata: Metadata = {
  title: "Live desi TV — Hindi and English news channels | Godesi",
  description:
    "Watch live desi TV news: NDTV, Aaj Tak, ABP News, India Today and DD News, streamed through their official YouTube live channels.",
};

export const dynamic = "force-dynamic";

export default async function LiveTvPage() {
  const resolved = await Promise.all(
    TV_CHANNELS.map(
      async (channel) => [channel.id, await liveVideoId(channel)] as const,
    ),
  );
  const channels = await tvEntries(new Map(resolved));

  return (
    <div className="space-y-4">
      <Card className="border-rose-200 bg-gradient-to-br from-rose-50 via-white to-amber-50">
        <h1 className="text-2xl font-black sm:text-3xl">📺 Live desi TV</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-700">
          Hindi and English news channels, live from their official YouTube
          streams. Channels start muted — tap the sound icon in the player to
          listen.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <LinkButton href="/live/submit">➕ Submit your channel</LinkButton>
          <Link
            href="/live-radio"
            className="text-sm font-bold text-rose-800 underline"
          >
            🎧 Listen to live radio instead →
          </Link>
        </div>
        <p className="mt-2 text-xs text-slate-600">
          Carriage is ${LIVE_CHANNEL_MONTHLY_USD}/month, free for charities and
          non-profits. Something not playing? Use 🚩 Not working on the channel.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {channels.map((channel) => (
          <LiveEmbedCard
            key={channel.key}
            kind="tv"
            id={channel.key}
            name={channel.name}
            place={channel.place}
            src={channel.src}
            featured={channel.featured}
            about={channel.about}
            websiteUrl={channel.websiteUrl}
            nonProfit={channel.nonProfit}
            submitted={channel.submitted}
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
