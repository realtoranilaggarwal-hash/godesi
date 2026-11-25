import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { searchBusinesses } from "@/lib/businesses";
import { BusinessTile } from "@/components/BusinessTile";
import { EventCard } from "@/components/EventCard";
import { AstroToday } from "@/components/AstroToday";
import { DealsStrip } from "@/components/DealsStrip";
import { ShareButtons } from "@/components/ShareButtons";
import { CONTENT_TTL, cachedQuery } from "@/lib/cache";
import { dailyNewsPicks, marketQuotes, money } from "@/lib/morningExtras";
import { newsPath } from "@/lib/newsLinks";
import { visitorPanchang } from "@/lib/panchangGeo";
import { SIGN_EMOJI, SIGN_SLUGS, dailySky } from "@/lib/horoscope";
import { RASHIS } from "@/lib/kundliSigns";
import { festivalSlug, todaysFestivals } from "@/lib/festivals";
import { siteUrl } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "GoDesi Daily — today's Panchang, desi news, gold & rupee rates, events and deals",
  description:
    "Your desi day in one page: today's Panchang and Rahu Kaal, horoscope, Indian and NRI news, dollar-to-rupee and gold prices, events this week, deals from desi businesses and new businesses on GoDesi.",
  alternates: { canonical: "/daily" },
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Quotes come from Yahoo, so every visitor shares one fetch per half hour. */
const dailyMarkets = cachedQuery("daily-markets", 1800, () => marketQuotes());

const dailyNews = cachedQuery("daily-news", 900, () =>
  dailyNewsPicks(new Date(), 8),
);

const weekEvents = cachedQuery("daily-week-events", CONTENT_TTL, () => {
  const now = new Date();
  return db.event.findMany({
    where: {
      status: "APPROVED",
      startsAt: { gte: now, lte: new Date(now.getTime() + WEEK_MS) },
    },
    orderBy: { startsAt: "asc" },
    take: 6,
    include: {
      category: { select: { name: true, icon: true, color: true } },
      tiers: { select: { price: true } },
    },
  });
});

function change(q: { price: number; previous: number | null }) {
  if (!q.previous) return null;
  const pct = ((q.price - q.previous) / q.previous) * 100;
  if (Math.abs(pct) < 0.005) return <span className="text-slate-500">0.00%</span>;
  return pct > 0 ? (
    <span className="text-emerald-700">▲ {pct.toFixed(2)}%</span>
  ) : (
    <span className="text-rose-700">▼ {Math.abs(pct).toFixed(2)}%</span>
  );
}

function Heading({ title, href, link }: { title: string; href?: string; link?: string }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-2">
      <h2 className="text-xl font-bold">{title}</h2>
      {href ? (
        <Link href={href} className="text-sm font-semibold text-indigo-600 hover:underline">
          {link} →
        </Link>
      ) : null}
    </div>
  );
}

export default async function DailyPage() {
  const [markets, news, eventRows, businesses] = await Promise.all([
    dailyMarkets().catch(() => []),
    dailyNews().catch(() => []),
    weekEvents(),
    searchBusinesses({ take: 4, sort: "recent" }),
  ]);
  const sky = dailySky();
  const today = visitorPanchang();
  const festivals = todaysFestivals();
  // Cached rows come back JSON-serialised, so dates are strings again.
  const events = eventRows.map((event) => ({
    ...event,
    startsAt: new Date(event.startsAt),
  }));
  const moon = RASHIS[sky.moonSign];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="rounded-3xl bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-600 p-6 text-white shadow">
        <p className="text-sm font-semibold uppercase tracking-wider opacity-90">GoDesi Daily</p>
        <h1 className="text-3xl font-black">{sky.dateLabel}</h1>
        <p className="mt-1 opacity-95">
          Panchang, news, markets, events and deals for the desi community — one page, every
          morning.
        </p>
        {festivals.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {festivals.map((f) => (
              <Link
                key={f.name}
                href={`/festivals/${festivalSlug(f)}`}
                className="rounded-full bg-white/20 px-3 py-1 text-sm font-bold hover:bg-white/30"
              >
                {f.emoji} {f.daysAway === 0 ? `Happy ${f.name}!` : `${f.name} tomorrow`}
              </Link>
            ))}
          </div>
        ) : null}
        <div className="mt-4">
          <ShareButtons url={`${siteUrl()}/daily`} title={`GoDesi Daily — ${sky.dateLabel}`} />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
        <section className="space-y-3">
          <Heading title="🪔 Panchang & horoscope" href="/astrology/panchang" link="Full Panchang" />
          {today.panchang ? (
            <AstroToday panchang={today.panchang} place={today.label} />
          ) : null}
          <p className="rounded-xl bg-indigo-50 p-3 text-sm text-indigo-900">
            🌙 The Moon is in <b>{moon.name}</b> ({moon.english})
            {sky.nextSign
              ? `, moving into ${RASHIS[sky.nextSign.sign].name} at ${sky.nextSign.at} ET`
              : ""}
            .{" "}
            <Link href="/astrology/horoscope" className="font-bold underline">
              Read your rashi&apos;s day
            </Link>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SIGN_SLUGS.map((slug, sign) => (
              <Link
                key={slug}
                href={`/astrology/horoscope/${slug}`}
                className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                {SIGN_EMOJI[sign]} {RASHIS[sign].name}
              </Link>
            ))}
          </div>
        </section>

        <section>
          <Heading title="📈 Gold, rupee & markets" href="/markets" link="Live charts" />
          {markets.length ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <tbody>
                  {markets.map((row) => (
                    <tr key={row.symbol} className="border-b border-slate-100 last:border-0">
                      <td className="px-3 py-2">{row.label}</td>
                      <td className="px-3 py-2 text-right font-bold">
                        {money(row.q.price, row.format)}
                      </td>
                      <td className="px-3 py-2 text-right text-xs">{change(row.q)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-600">Market prices are unavailable right now.</p>
          )}
          <p className="mt-2 text-xs text-slate-500">
            Last price and change since the previous close. Delayed, for information only — not
            financial advice.{" "}
            <Link href="/usd-to-inr" className="font-semibold text-indigo-600">
              Dollar to rupee converter →
            </Link>
          </p>
        </section>
      </div>

      {news.length ? (
        <section>
          <Heading title="📰 Today's desi news" href="/news" link="All news" />
          <ul className="grid gap-2 sm:grid-cols-2">
            {news.map((item) => (
              <li key={item.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <Link href={newsPath(item)} className="font-semibold text-slate-900 hover:text-indigo-700">
                  {item.title}
                </Link>
                <p className="text-xs text-slate-500">{item.source}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <Heading title="🎟️ Events this week" href="/events" link="All events" />
        {events.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} variant="tile" />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-600">
            No events in the next 7 days yet.{" "}
            <Link href="/events" className="font-semibold text-indigo-600">
              See what&apos;s coming up →
            </Link>
          </p>
        )}
      </section>

      <DealsStrip />

      {businesses.length ? (
        <section>
          <Heading title="🏪 New on GoDesi" href="/search" link="All businesses" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {businesses.map((business) => (
              <BusinessTile key={business.id} business={business} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <b>Get GoDesi Daily in your inbox.</b> Members get this every morning by email.{" "}
        <Link href="/signup" className="font-bold underline">
          Join free
        </Link>
      </section>
    </div>
  );
}
