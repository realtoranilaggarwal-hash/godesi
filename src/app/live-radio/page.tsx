import type { Metadata } from "next";
import Link from "next/link";
import { Card, LinkButton } from "@/components/ui";
import { LiveRadioRow } from "@/components/LiveRadioRow";
import { radioEntries, LIVE_CHANNEL_MONTHLY_USD } from "@/lib/liveChannels";
import { searchStations } from "@/lib/radioBrowser";
import { RadioBrowserSearch } from "@/components/RadioBrowserSearch";
import { SponsoredCard } from "@/components/SponsoredCard";
import { liveVoteCounts } from "@/lib/liveVotes";

export const metadata: Metadata = {
  title: "Live desi radio — Hindi, Punjabi and Bollywood stations | Godesi",
  description:
    "Listen to live desi radio: Bollywood, Hindi, Punjabi and news stations from India and the USA, streamed through their official TuneIn players.",
};

export const dynamic = "force-dynamic";

export default async function LiveRadioPage() {
  const [stations, browsed, votes] = await Promise.all([
    radioEntries(),
    searchStations({ country: "IN" }),
    liveVoteCounts(),
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

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <ul className="grid gap-2 sm:grid-cols-2">
          {stations.map((station) => (
            <LiveRadioRow
              key={station.key}
              id={station.key}
              name={station.name}
              place={station.place}
              src={station.src}
              featured={station.featured}
              about={station.about}
              websiteUrl={station.websiteUrl}
              nonProfit={station.nonProfit}
              votes={votes[station.key] ?? 0}
            />
          ))}
        </ul>
        <SponsoredCard />
      </div>

      <RadioBrowserSearch initial={browsed} />

      <Card className="border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 via-white to-amber-50">
        <h2 className="text-lg font-black">📣 Godesi is looking for you</h2>
        <p className="mt-1 max-w-3xl text-sm text-slate-700">
          Are you a radio jockey, podcaster or a journalist? Host a show for the
          desi community, or report what is happening in your city — we give you
          the audience, the page and the credit.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <LinkButton href="/live/submit">🎙 Host a show or channel</LinkButton>
          <Link
            href="/journalists"
            className="rounded-xl border border-fuchsia-300 px-4 py-2 text-sm font-bold text-fuchsia-800 hover:bg-fuchsia-50"
          >
            🗞️ Become a Godesi journalist
          </Link>
          <Link
            href="/contact"
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Talk to us
          </Link>
        </div>
      </Card>

      <p className="text-xs text-slate-500">
        Streams are played through each broadcaster&apos;s own TuneIn player.
        Godesi does not host, record or re-stream any audio.
      </p>
    </div>
  );
}
