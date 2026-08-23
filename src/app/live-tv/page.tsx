import type { Metadata } from "next";
import Link from "next/link";
import { Card, LinkButton } from "@/components/ui";
import { LiveEmbedCard } from "@/components/LiveEmbedCard";
import { TV_CHANNELS } from "@/lib/liveMedia";
import { liveVideoIds } from "@/lib/liveTv";
import { LiveOffAirRow } from "@/components/LiveOffAirRow";
import { tvEntries, LIVE_CHANNEL_MONTHLY_USD } from "@/lib/liveChannels";
import { SponsoredCard } from "@/components/SponsoredCard";
import { liveVoteCounts } from "@/lib/liveVotes";
import { getCurrentUser } from "@/lib/auth";
import { liveFavoriteKeys } from "@/lib/liveFavorites";
import { LiveSignupNudge } from "@/components/LiveSignupNudge";

export const metadata: Metadata = {
  title: "Live desi TV — Hindi and English news channels | Godesi",
  description:
    "Watch live desi TV news: NDTV, Aaj Tak, ABP News, India Today and DD News, streamed through their official YouTube live channels.",
};

export const dynamic = "force-dynamic";

/** Grid order: the biggest audiences first, then the regional channels. */
const LANGUAGE_ORDER = [
  "Hindi",
  "English",
  "Marathi",
  "Malayalam",
  "Tamil",
  "Kannada",
  "Desi",
];

export default async function LiveTvPage() {
  const resolved = await liveVideoIds(TV_CHANNELS);
  const [channels, votes, user] = await Promise.all([
    tvEntries(resolved),
    liveVoteCounts(),
    getCurrentUser(),
  ]);
  const favorites = await liveFavoriteKeys(user?.id ?? null);

  const liveNow = channels.filter((channel) => channel.live);
  const offAir = channels.filter((channel) => !channel.live);
  // Same language together, so the grid reads as a channel guide.
  const groups = LANGUAGE_ORDER.map((language) => ({
    language,
    channels: liveNow.filter((channel) => (channel.language ?? "Desi") === language),
  })).filter((group) => group.channels.length);
  const ungrouped = liveNow.filter(
    (channel) => !LANGUAGE_ORDER.includes(channel.language ?? "Desi"),
  );

  return (
    <div className="space-y-4">
      <Card className="border-rose-200 bg-gradient-to-br from-rose-50 via-white to-amber-50">
        <h1 className="text-2xl font-black sm:text-3xl">📺 Live desi TV</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-700">
          Hindi and English news channels, live from their official YouTube
          streams. Channels start muted — tap the sound icon in the player to
          listen. Free to watch, no account needed — sign up only if you want to
          save favourites.
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

      {[...groups, ...(ungrouped.length ? [{ language: "More channels", channels: ungrouped }] : [])].map(
        (group, index) => (
          <section key={group.language} className="space-y-3">
            <h2 className="text-lg font-black">
              {group.language} <span className="text-slate-400">· live now</span>
            </h2>
            <div className="grid gap-4 lg:grid-cols-2">
              {group.channels.map((channel) => (
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
                  votes={votes[channel.key] ?? 0}
                  saved={favorites.has(channel.key)}
                  signedIn={user !== null}
                />
              ))}
              {index === 0 ? <SponsoredCard /> : null}
            </div>
          </section>
        ),
      )}

      {offAir.length ? (
        <Card className="space-y-3">
          <div>
            <h2 className="text-lg font-black">😴 Off air right now</h2>
            <p className="text-xs text-slate-600">
              These broadcasters are not streaming live at the moment, so we do
              not load a dead player. They come back into the grid the minute
              their live show starts.
            </p>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {offAir.map((channel) => (
              <LiveOffAirRow
                key={channel.key}
                id={channel.key}
                name={channel.name}
                place={channel.place}
                websiteUrl={channel.websiteUrl}
                votes={votes[channel.key] ?? 0}
              />
            ))}
          </ul>
        </Card>
      ) : null}

      {user ? null : <LiveSignupNudge kind="tv" />}

      <p className="text-xs text-slate-500">
        Every stream is the broadcaster&apos;s own YouTube live channel. Godesi
        does not host, record or re-stream any video.
      </p>
    </div>
  );
}
