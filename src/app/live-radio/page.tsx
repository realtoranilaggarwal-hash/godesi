import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui";
import { LiveEmbedCard } from "@/components/LiveEmbedCard";
import { RADIO_STATIONS, radioEmbedUrl } from "@/lib/liveMedia";

export const metadata: Metadata = {
  title: "Live desi radio — Hindi, Punjabi and Bollywood stations | Godesi",
  description:
    "Listen to live desi radio: Bollywood, Hindi, Punjabi and news stations from India and the USA, streamed through their official TuneIn players.",
};

export default function LiveRadioPage() {
  return (
    <div className="space-y-4">
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50">
        <h1 className="text-2xl font-black sm:text-3xl">🎧 Live desi radio</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-700">
          Bollywood, Hindi, Punjabi and news stations from India and the USA.
          Press play on any station — or tap &ldquo;keep playing while I
          browse&rdquo; and it follows you around Godesi in a mini player.
        </p>
        <Link
          href="/live-tv"
          className="mt-3 inline-block text-sm font-bold text-emerald-800 underline"
        >
          📺 Watch live TV instead →
        </Link>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {RADIO_STATIONS.map((station) => (
          <LiveEmbedCard
            key={station.id}
            kind="radio"
            id={station.id}
            name={station.name}
            place={station.place}
            src={radioEmbedUrl(station)}
            height={100}
          />
        ))}
      </div>

      <p className="text-xs text-slate-500">
        Streams are played through each broadcaster&apos;s own TuneIn player.
        Godesi does not host, record or re-stream any audio.
      </p>
    </div>
  );
}
