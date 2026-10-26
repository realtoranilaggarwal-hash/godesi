import type { Metadata } from "next";
import { investorUnlocked } from "@/lib/investor";
import { InvestorGate } from "./InvestorGate";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "GoDesi investor kit",
  description: "Confidential investor overview for GoDesi.com.",
  robots: { index: false, follow: false },
};

const usd = (n: number) =>
  "$" + Math.round(n).toLocaleString("en-US", { maximumFractionDigits: 0 });

/* ---------------- revenue streams ---------------- */

const STREAMS = [
  {
    icon: "📇",
    name: "Classified & vendor upgrades — $100/year",
    detail:
      "Businesses pay $100/yr to upgrade their free listing to a promoted classified: top-of-search placement, deal publishing and enquiry leads.",
    year1: 120000,
  },
  {
    icon: "🖼️",
    name: "Sidebar & banner advertising",
    detail:
      "Self-serve banner slots across the site (header, sidebar, billboards) booked directly through /advertise — modelled at an average $25/month per sold slot.",
    year1: 7200,
  },
  {
    icon: "⭐",
    name: "Pro & Premium memberships",
    detail:
      "Members upgrade for more categories, photos, videos and priority placement — $5.99/mo Pro and $20/mo Premium.",
    year1: 3600,
  },
  {
    icon: "🌐",
    name: "Done-for-you websites",
    detail:
      "$99 setup + $10/mo hosting for a 5-page business site (run with SocialDada). Sticky recurring revenue.",
    year1: 2600,
  },
  {
    icon: "🧱",
    name: "Wall of Fame bricks",
    detail:
      "$4 one-time per brick on the 250,000-brick community wall — funded-like merchandise with near-zero cost.",
    year1: 1200,
  },
  {
    icon: "📚",
    name: "Courses & digital products",
    detail:
      "Own $9 courses plus a 90/10 split where GoDesi keeps 10% of every creator's course sale.",
    year1: 1500,
  },
  {
    icon: "🔓",
    name: "Lead unlocks & deal sponsorships",
    detail:
      "Businesses pay to unlock client requirements; sponsored Deal-of-the-Day and featured placements.",
    year1: 1200,
  },
  {
    icon: "🎟️",
    name: "Event ticketing & partners",
    detail:
      "Commission on paid event tickets, plus travel/tools affiliate links and Google AdSense on unsold banner space.",
    year1: 1800,
  },
];

/* ---------------- the model ---------------- */

const ASSUMPTIONS = [
  "10 sales reps (“the girls”), each closing 10 classified upgrades per month → 1,200 sales/yr",
  "Each classified upgrade = $100/year subscription",
  "24 banner slots sold on average at $25/month",
  "Other streams (memberships, websites, bricks, courses, leads, events, affiliates) from current pricing",
  "All revenue grows 10% each year as reps get better and the directory fills in",
];

const COSTS = [
  { name: "Vercel hosting (Pro plan)", today: "$20/month", note: "All 15+ sites run on one plan" },
  { name: "Neon Postgres database", today: "$0 (free tier)", note: "Free until ~10 GB storage / heavier compute" },
  { name: "Resend email", today: "$0 (free tier)", note: "100 emails/day — covers morning emails now" },
  { name: "Domains (~15 sites)", today: "≈$15/yr each", note: "≈$225/year total renewals" },
];

/** Annual infra allowance used in the projection, growing as traffic scales. */
const INFRA = [525, 900, 1600, 2800, 4500];

const GROWTH = 1.1;
const YEARS = 5;

export default function InvestorsPage() {
  if (!investorUnlocked()) {
    return (
      <div className="mx-auto max-w-md py-16">
        <Card className="space-y-4 p-6">
          <div className="text-center">
            <p className="text-3xl">🔐</p>
            <h1 className="mt-2 text-xl font-black text-slate-900">
              GoDesi investor kit
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Confidential — enter the password shared with you.
            </p>
          </div>
          <InvestorGate />
        </Card>
      </div>
    );
  }

  const classifiedY1 = STREAMS[0].year1;
  const bannerY1 = STREAMS[1].year1;
  const otherY1 = STREAMS.slice(2).reduce((s, x) => s + x.year1, 0);
  const grossY1 = classifiedY1 + bannerY1 + otherY1;

  const rows = Array.from({ length: YEARS }, (_, i) => {
    const factor = Math.pow(GROWTH, i);
    const classified = classifiedY1 * factor;
    const banners = bannerY1 * factor;
    const other = otherY1 * factor;
    const gross = classified + banners + other;
    const infra = INFRA[i];
    return { year: i + 1, classified, banners, other, gross, infra, net: gross - infra };
  });

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Card className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
          Confidential · For invited investors only
        </p>
        <h1 className="mt-1 text-3xl font-black">
          GoDesi — investor revenue kit
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-white/85">
          GoDesi.com is a live desi business directory + community platform:
          free listings, digital business cards, events, deals, courses and a
          pixel wall — monetized through subscriptions, advertising and services.
          Below is the projected income model.
        </p>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-black">💰 Every way GoDesi makes money</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {STREAMS.map((s) => (
            <li
              key={s.name}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <p className="text-sm font-bold text-slate-900">
                {s.icon} {s.name}
              </p>
              <p className="mt-1 text-xs leading-snug text-slate-600">
                {s.detail}
              </p>
              <p className="mt-1 text-xs font-black text-emerald-700">
                Year-1 estimate: {usd(s.year1)}
              </p>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="space-y-2">
        <h2 className="text-lg font-black">📐 The sales model</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          {ASSUMPTIONS.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
        <p className="text-xs text-slate-500">
          Conservative check: if reps sell 10 per <em>year</em> each instead of
          10/month, Year-1 classified income is $12,000 instead of $120,000 —
          the table below uses the monthly rate.
        </p>
      </Card>

      <Card className="space-y-3 overflow-x-auto">
        <h2 className="text-lg font-black">
          📈 5-year projection (10% growth per year)
        </h2>
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="py-2 pr-3">Year</th>
              <th className="py-2 pr-3 text-right">Classifieds</th>
              <th className="py-2 pr-3 text-right">Banners</th>
              <th className="py-2 pr-3 text-right">Other streams</th>
              <th className="py-2 pr-3 text-right">Gross</th>
              <th className="py-2 pr-3 text-right">Server costs</th>
              <th className="py-2 text-right font-black text-slate-900">
                Net income
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.year} className="border-b border-slate-100">
                <td className="py-2 pr-3 font-bold">Year {r.year}</td>
                <td className="py-2 pr-3 text-right">{usd(r.classified)}</td>
                <td className="py-2 pr-3 text-right">{usd(r.banners)}</td>
                <td className="py-2 pr-3 text-right">{usd(r.other)}</td>
                <td className="py-2 pr-3 text-right font-semibold">
                  {usd(r.gross)}
                </td>
                <td className="py-2 pr-3 text-right text-rose-700">
                  −{usd(r.infra)}
                </td>
                <td className="py-2 text-right font-black text-emerald-700">
                  {usd(r.net)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-slate-500">
          Net = gross minus server/domain/email costs only. Sales-team pay
          (usually 10–20% commission) and card-processing fees (~3%) are not
          deducted here — deduct them on top.
        </p>
      </Card>

      <Card className="space-y-2">
        <h2 className="text-lg font-black">🖥️ What the platform costs today</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {COSTS.map((c) => (
            <li
              key={c.name}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <p className="text-sm font-bold text-slate-900">{c.name}</p>
              <p className="text-sm font-black text-indigo-700">{c.today}</p>
              <p className="mt-0.5 text-xs text-slate-500">{c.note}</p>
            </li>
          ))}
        </ul>
        <p className="text-sm text-slate-600">
          Current real spend: <b>≈$300–350/year</b>. The projection reserves a
          growing allowance ({usd(INFRA[0])} in Year 1 rising to{" "}
          {usd(INFRA[YEARS - 1])} by Year {YEARS}) so costs are never
          understated as traffic and email volume grow.
        </p>
      </Card>

      <Card className="border-amber-200 bg-amber-50 text-sm text-amber-900">
        <p className="font-bold">About these numbers</p>
        <p className="mt-1">
          Figures are illustrative projections based on stated assumptions —
          they are not audited results or a promise of future income. Live
          product: godesi.com · oaktreebazaar.com · eventringer.com plus 12
          sister sites feeding it traffic.
        </p>
      </Card>
    </div>
  );
}
