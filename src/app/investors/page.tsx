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
const num = (n: number, digits = 1) =>
  n.toLocaleString("en-US", { maximumFractionDigits: digits });

/* ---------------- revenue streams beyond rep ad sales ---------------- */

const STREAMS = [
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
      "$4 one-time per brick on the 250,000-brick community wall — near-zero cost.",
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

const REPS_Y1 = 10; // sales reps in year 1
const ADS_PER_REP_Y1 = 10; // ads booked per rep per month in year 1
const AD_PRICE = [100, 150, 200, 250, 300]; // $/ad per year 1–5
const VOLUME_GROWTH = 1.1; // ads-per-rep AND rep count both +10%/yr
const OTHER_GROWTH = 1.1;
const YEARS = 5;

const ASSUMPTIONS = [
  `Year 1: ${REPS_Y1} sales reps (“the girls”), each booking ${ADS_PER_REP_Y1} ads per month at $${AD_PRICE[0]}/ad`,
  `Price per ad rises each year: ${AD_PRICE.map((p, i) => `Y${i + 1} $${p}`).join(" · ")}`,
  `Each rep's bookings grow 10%/yr (10 → ${num(ADS_PER_REP_Y1 * Math.pow(VOLUME_GROWTH, YEARS - 1))} ads/month by Year ${YEARS})`,
  `Rep headcount grows with volume — ${REPS_Y1} → ≈${num(REPS_Y1 * Math.pow(VOLUME_GROWTH, YEARS - 1))} reps by Year ${YEARS}`,
  "Other income (memberships, websites, bricks, courses, leads, events, affiliates) grows 10%/yr",
];

const COSTS = [
  { name: "Vercel hosting (Pro plan)", today: "$20/month", note: "All 15+ sites run on one plan" },
  { name: "Neon Postgres database", today: "$0 (free tier)", note: "Free until ~10 GB storage / heavier compute" },
  { name: "Resend email", today: "$0 (free tier)", note: "100 emails/day — covers morning emails now" },
  { name: "Domains (~15 sites)", today: "≈$15/yr each", note: "≈$225/year total renewals" },
];

/** Annual infra allowance used in the projection, growing as traffic scales. */
const INFRA = [525, 900, 1600, 2800, 4500];

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur">
      <p className="text-2xl font-black text-white sm:text-3xl">{value}</p>
      <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-emerald-300">
        {label}
      </p>
      {hint ? <p className="mt-1 text-[11px] text-white/60">{hint}</p> : null}
    </div>
  );
}

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

  const otherY1 = STREAMS.reduce((s, x) => s + x.year1, 0);

  const rows = Array.from({ length: YEARS }, (_, i) => {
    const factor = Math.pow(VOLUME_GROWTH, i);
    const reps = REPS_Y1 * factor;
    const adsPerRep = ADS_PER_REP_Y1 * factor;
    const price = AD_PRICE[i];
    const adSales = reps * adsPerRep * 12 * price;
    const other = otherY1 * Math.pow(OTHER_GROWTH, i);
    const gross = adSales + other;
    const infra = INFRA[i];
    return {
      year: i + 1,
      reps,
      adsPerRep,
      price,
      adSales,
      other,
      gross,
      infra,
      net: gross - infra,
    };
  });

  const totalGross = rows.reduce((s, r) => s + r.gross, 0);
  const totalNet = rows.reduce((s, r) => s + r.net, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* SaaS-style hero */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-emerald-950 p-6 text-white sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-300">
          Confidential · Investor kit · 2026
        </p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">
          GoDesi — ad-sales growth engine
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-white/80">
          A live desi business directory + community platform — listings, digital
          cards, events, deals, courses, pixel wall — monetized by a rep-driven
          ad sales model on top of subscription and service revenue.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile
            label="Year-1 gross"
            value={usd(rows[0].gross)}
            hint={`${usd(rows[0].adSales)} from rep ad sales`}
          />
          <StatTile
            label={`Year-${YEARS} gross`}
            value={usd(rows[YEARS - 1].gross)}
            hint={`${usd(rows[YEARS - 1].adSales)} from rep ad sales`}
          />
          <StatTile
            label={`${YEARS}-yr total gross`}
            value={usd(totalGross)}
          />
          <StatTile
            label={`${YEARS}-yr net after servers`}
            value={usd(totalNet)}
            hint="Before sales-team pay & card fees"
          />
        </div>
      </div>

      {/* revenue streams */}
      <Card className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-black">💰 Every way GoDesi makes money</h2>
          <p className="text-xs font-semibold text-slate-500">
            Core engine: rep-booked ads · everything below stacks on top
          </p>
        </div>
        <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4">
          <p className="text-sm font-bold text-emerald-900">
            📇 Rep-booked ads — classifieds, banners &amp; featured placements
          </p>
          <p className="mt-1 text-xs leading-snug text-emerald-800">
            The growth engine: each rep books {ADS_PER_REP_Y1} ads/month in Year
            1 — banner slots, promoted classifieds and featured placements sold
            to the 15,000+ desi businesses already listed.
          </p>
          <p className="mt-1 text-xs font-black text-emerald-700">
            Year-1: {usd(rows[0].adSales)} → Year-{YEARS}:{" "}
            {usd(rows[YEARS - 1].adSales)}
          </p>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {STREAMS.map((s) => (
            <li
              key={s.name}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-indigo-200 hover:shadow-sm"
            >
              <p className="text-sm font-bold text-slate-900">
                {s.icon} {s.name}
              </p>
              <p className="mt-1 text-xs leading-snug text-slate-600">
                {s.detail}
              </p>
              <p className="mt-1 text-xs font-black text-emerald-700">
                Year-1: {usd(s.year1)}
              </p>
            </li>
          ))}
        </ul>
      </Card>

      {/* assumptions */}
      <Card className="space-y-2">
        <h2 className="text-lg font-black">📐 The sales model</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          {ASSUMPTIONS.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
        <p className="text-xs text-slate-500">
          Ads are annual bookings — each rep&rsquo;s book renews every year, so sales
          compound on top of retained accounts.
        </p>
      </Card>

      {/* projection table */}
      <Card className="space-y-3 overflow-x-auto">
        <h2 className="text-lg font-black">
          📈 {YEARS}-year projection — volume × price × headcount
        </h2>
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="py-2 pr-3">Year</th>
              <th className="py-2 pr-3 text-right">Reps</th>
              <th className="py-2 pr-3 text-right">Ads/mo each</th>
              <th className="py-2 pr-3 text-right">$ per ad</th>
              <th className="py-2 pr-3 text-right">Ad sales</th>
              <th className="py-2 pr-3 text-right">Other income</th>
              <th className="py-2 pr-3 text-right">Gross</th>
              <th className="py-2 pr-3 text-right">Servers</th>
              <th className="py-2 text-right font-black text-slate-900">Net</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.year} className="border-b border-slate-100">
                <td className="py-2 pr-3 font-bold">Y{r.year}</td>
                <td className="py-2 pr-3 text-right">{num(r.reps)}</td>
                <td className="py-2 pr-3 text-right">{num(r.adsPerRep)}</td>
                <td className="py-2 pr-3 text-right">{usd(r.price)}</td>
                <td className="py-2 pr-3 text-right font-semibold text-indigo-700">
                  {usd(r.adSales)}
                </td>
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

      {/* real costs */}
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
