import type { Metadata } from "next";
import {
  cryptoFearGreed,
  fearGreedColor,
  type FearGreedDay,
} from "@/lib/fearGreed";
import { ShareButtons } from "@/components/ShareButtons";
import { SidebarBanners } from "@/components/Banners";
import { siteUrl } from "@/lib/format";
import { Card } from "@/components/ui";
import { FinancialAdviceBanner } from "@/components/FinancialAdviceBanner";
import { cryptoHeadlines } from "@/lib/cryptoNews";
import { PARTNER_OFFERS } from "@/lib/partnerOffers";
import { TemuCryptoStore } from "@/components/TemuCryptoStore";

export const revalidate = 3600;

function shortDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "America/New_York",
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const [today] = await cryptoFearGreed();
  return {
    title: today
      ? `Crypto Fear & Greed Index today: ${today.value} (${today.label})`
      : "Crypto Fear & Greed Index today",
    description:
      "Today's Bitcoin and crypto Fear & Greed Index on a live gauge, with yesterday, last week, last month and a 30-day chart.",
    alternates: { canonical: "/crypto-fear-greed" },
  };
}

const BANDS = [
  { from: 0, to: 25, color: "#dc2626" },
  { from: 25, to: 47, color: "#f97316" },
  { from: 47, to: 55, color: "#eab308" },
  { from: 55, to: 76, color: "#84cc16" },
  { from: 76, to: 100, color: "#16a34a" },
];

function point(value: number, radius: number) {
  const angle = Math.PI * (1 - value / 100);
  return {
    x: 120 + radius * Math.cos(angle),
    y: 120 - radius * Math.sin(angle),
  };
}

function arc(from: number, to: number, radius: number) {
  const start = point(from, radius);
  const end = point(to, radius);
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`;
}

function Gauge({ value }: { value: number }) {
  const needle = point(value, 82);
  return (
    <svg
      viewBox="0 0 240 135"
      className="mx-auto w-full max-w-sm"
      role="img"
      aria-label={`Index ${value} of 100`}
    >
      {BANDS.map((band) => (
        <path
          key={band.from}
          d={arc(band.from, band.to, 100)}
          stroke={band.color}
          strokeWidth="22"
          fill="none"
        />
      ))}
      <line
        x1="120"
        y1="120"
        x2={needle.x}
        y2={needle.y}
        stroke="#0f172a"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="120" cy="120" r="9" fill="#0f172a" />
      <text x="14" y="134" fontSize="10" fill="#64748b">
        0
      </text>
      <text x="216" y="134" fontSize="10" fill="#64748b">
        100
      </text>
    </svg>
  );
}

function Then({ label, day }: { label: string; day?: FearGreedDay }) {
  if (!day) return null;
  return (
    <p className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold">
        {day.label}{" "}
        <span
          className="ml-1 inline-block rounded-full px-2 py-0.5 text-xs text-white"
          style={{ backgroundColor: fearGreedColor(day.value) }}
        >
          {day.value}
        </span>
      </span>
    </p>
  );
}

function Attribution() {
  return (
    <p className="text-xs text-slate-500">
      Data from{" "}
      <a
        href="https://alternative.me/crypto/fear-and-greed-index/"
        target="_blank"
        rel="noreferrer noopener"
        className="underline"
      >
        alternative.me Crypto Fear &amp; Greed Index
      </a>
      , updated once a day. Not investment advice.
    </p>
  );
}

export default async function CryptoFearGreedPage() {
  const [days, headlines] = await Promise.all([
    cryptoFearGreed(),
    cryptoHeadlines(),
  ]);
  const today = days[0];
  const history = days.slice(0, 30).reverse();

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-5">
        <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-800 px-5 py-8 text-white sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
            Crypto market mood today
          </p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            Crypto Fear &amp; Greed Index
          </h1>
          <p className="mt-3 max-w-2xl text-white/90">
            One number from 0 (extreme fear) to 100 (extreme greed) for how
            Bitcoin and the big coins feel today.
          </p>
        </section>

        {today ? (
          <>
            <Card>
              <Gauge value={today.value} />
              <p
                className="mt-2 text-center text-4xl font-black"
                style={{ color: fearGreedColor(today.value) }}
              >
                {today.value}
              </p>
              <p className="text-center text-lg font-bold">{today.label}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <Then label="Yesterday" day={days[1]} />
                <Then label="Last week" day={days[7]} />
                <Then label="Last month" day={days[30]} />
              </div>
              <div className="mt-3">
                <Attribution />
              </div>
            </Card>

            <Card>
              <h2 className="mb-3 font-bold">Last 30 days</h2>
              <div className="flex h-32 items-end gap-0.5">
                {history.map((day) => (
                  <div
                    key={day.date}
                    title={`${day.date}: ${day.value} (${day.label})`}
                    className="flex-1 rounded-t"
                    style={{
                      height: `${Math.max(day.value, 3)}%`,
                      backgroundColor: fearGreedColor(day.value),
                    }}
                  />
                ))}
              </div>
              <div className="mt-1 flex justify-between text-xs text-slate-500">
                <span>{history[0]?.date}</span>
                <span>{history[history.length - 1]?.date}</span>
              </div>
              <div className="mt-3">
                <Attribution />
              </div>
            </Card>
          </>
        ) : (
          <Card>
            <p className="text-sm text-slate-600">
              The index feed is not answering right now — try again in a few
              minutes.
            </p>
          </Card>
        )}

        <FinancialAdviceBanner />

        <div>
          <Card>
            <h2 className="mb-3 font-bold">
              Buy, trade and store crypto — our partner offers
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {PARTNER_OFFERS.map((offer) => (
                <a
                  key={offer.href}
                  href={offer.href}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                >
                  {offer.label} →
                </a>
              ))}
            </div>
          </Card>
          <p className="mt-1 px-1 text-[11px] text-slate-500">
            Ad · these are referral links — GoDesi may earn a bonus at no cost
            to you. Not financial advice.
          </p>
        </div>

        <TemuCryptoStore />

        {headlines.length ? (
          <Card>
            <h2 className="font-bold">📰 Latest crypto news</h2>
            <p className="mb-3 text-xs text-slate-500">
              Bitcoin, Ethereum and crypto headlines from news sites across the
              web, refreshed every hour. Each one opens on the publisher&apos;s
              own site.
            </p>
            <ul className="divide-y divide-slate-100">
              {headlines.map((item) => (
                <li key={item.link} className="py-2">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-semibold text-slate-900 hover:text-indigo-700 hover:underline"
                  >
                    {item.title}
                  </a>
                  <span className="block text-xs text-slate-500">
                    {item.source ? `${item.source} · ` : ""}
                    {shortDate(item.publishedAt)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        <Card>
          <h2 className="mb-2 font-bold">How to read it</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>
              <b>0–24 Extreme Fear:</b> people are selling in a panic.
            </li>
            <li>
              <b>25–46 Fear</b>, <b>47–54 Neutral</b>, <b>55–75 Greed</b>.
            </li>
            <li>
              <b>76–100 Extreme Greed:</b> prices may have run ahead of
              themselves.
            </li>
            <li>
              It measures mood (price swings, trading volume, social media,
              Bitcoin&apos;s share of the market and Google searches), not where
              prices will go.
            </li>
          </ul>
          <div className="mt-3">
            <ShareButtons
              url={`${siteUrl()}/crypto-fear-greed`}
              title={
                today
                  ? `Crypto Fear & Greed Index today: ${today.value} (${today.label})`
                  : "Crypto Fear & Greed Index today"
              }
            />
          </div>
        </Card>
      </div>
      <SidebarBanners />
    </div>
  );
}
