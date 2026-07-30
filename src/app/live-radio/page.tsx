import type { Metadata } from "next";
import Link from "next/link";
import { Card, LinkButton } from "@/components/ui";
import { LiveEmbedCard } from "@/components/LiveEmbedCard";
import { radioEntries, LIVE_CHANNEL_MONTHLY_USD } from "@/lib/liveChannels";
import { searchStations } from "@/lib/radioBrowser";
import { RadioBrowserSearch } from "@/components/RadioBrowserSearch";

export const metadata: Metadata = {
  title: "Live desi radio — Hindi, Punjabi and Bollywood stations | Godesi",
  description:
    "Listen to live desi radio: Bollywood, Hindi, Punjabi and news stations from India and the USA, streamed through their official TuneIn players.",
};

export const dynamic = "force-dynamic";

export default async function LiveRadioPage() {
  const [stations, browsed] = await Promise.all([
    radioEntries(),
    searchStations({ country: "IN" }),
  ]);

  return (
    <div className="space-y-4">
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50">
        <h1 className="text-2xl font-black sm:text-3xl">🎧 Live desi radio</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-700">
          Bollywood, Hindi, Punjabi and news stations from India and the USA.
          Press play on any station — or tap &ldquo;keep playing while I
          browse&rdquo; and it follows you around Godesi in a mini player.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <LinkButton href="/live/submit">➕ Submit your station</LinkButton>
          <Link
            href="/live-tv"
            className="text-sm font-bold text-emerald-800 underline"
          >
            📺 Watch live TV instead →
          </Link>
        </div>
        <p className="mt-2 text-xs text-slate-600">
          Carriage is ${LIVE_CHANNEL_MONTHLY_USD}/month, free for charities and
          non-profits. Something not playing? Use 🚩 Not working on the station.
        </p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {stations.map((station) => (
          <LiveEmbedCard
            key={station.key}
            kind="radio"
            id={station.key}
            name={station.name}
            place={station.place}
            src={station.src}
            height={100}
            featured={station.featured}
            about={station.about}
            websiteUrl={station.websiteUrl}
            nonProfit={station.nonProfit}
            submitted={station.submitted}
          />
        ))}
      </div>

      <RadioBrowserSearch initial={browsed} />

      <p className="text-xs text-slate-500">
        Streams are played through each broadcaster&apos;s own TuneIn player.
        Godesi does not host, record or re-stream any audio.
      </p>
    </div>
  );
}
