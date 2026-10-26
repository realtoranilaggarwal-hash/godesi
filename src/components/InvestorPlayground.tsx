"use client";

import { useMemo, useState } from "react";

const YEARS = 5;
const OTHER_Y1 = 11900;
const OTHER_GROWTH = 1.1;
const INFRA = [525, 900, 1600, 2800, 4500];
const PRICE_RAMP = [1, 1.5, 2, 2.5, 3]; // Y1 price × ramp = $100→$300 shape
const RAISE = 50000;
const PRE_MONEY = 230000; // build value + domains + trademark (see valuation card)
const POST_MONEY = PRE_MONEY + RAISE;

const usd = (n: number) =>
  "$" + Math.round(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
const num = (n: number, digits = 1) =>
  n.toLocaleString("en-US", { maximumFractionDigits: digits });

function Slider({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-bold text-slate-600">{label}</span>
        <span className="text-lg font-black text-indigo-700">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-indigo-600"
        aria-label={label}
      />
    </div>
  );
}

export function InvestorPlayground() {
  const [reps, setReps] = useState(10);
  const [adsPerRep, setAdsPerRep] = useState(10);
  const [price, setPrice] = useState(100);
  const [growth, setGrowth] = useState(10);
  const [invest, setInvest] = useState(5000);

  const rows = useMemo(() => {
    const g = 1 + growth / 100;
    return Array.from({ length: YEARS }, (_, i) => {
      const factor = Math.pow(g, i);
      const adSales = reps * factor * (adsPerRep * factor) * 12 * price * PRICE_RAMP[i];
      const other = OTHER_Y1 * Math.pow(OTHER_GROWTH, i);
      const gross = adSales + other;
      return { year: i + 1, adSales, gross, net: gross - INFRA[i] };
    });
  }, [reps, adsPerRep, price, growth]);

  const totalGross = rows.reduce((s, r) => s + r.gross, 0);
  const sharePct = Math.min(100, (invest / RAISE) * 100);
  const maxGross = Math.max(...rows.map((r) => r.gross), 1);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Slider
          label="Sales reps in Year 1"
          value={reps}
          display={`${reps}`}
          min={1}
          max={30}
          step={1}
          onChange={setReps}
        />
        <Slider
          label="Ads each rep books / month"
          value={adsPerRep}
          display={`${adsPerRep}`}
          min={2}
          max={30}
          step={1}
          onChange={setAdsPerRep}
        />
        <Slider
          label="Ad price in Year 1"
          value={price}
          display={usd(price)}
          min={50}
          max={300}
          step={10}
          onChange={setPrice}
        />
        <Slider
          label="Yearly volume & team growth"
          value={growth}
          display={`${growth}%`}
          min={0}
          max={30}
          step={1}
          onChange={setGrowth}
        />
      </div>

      {/* chart */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-end gap-2 sm:gap-4" role="img" aria-label="Bar chart of projected gross income for years 1 to 5">
          {rows.map((r) => (
            <div key={r.year} className="flex flex-1 flex-col items-center gap-1">
              <p className="text-xs font-black text-indigo-700">{usd(r.gross)}</p>
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 to-emerald-500 transition-all duration-300"
                style={{ height: `${Math.max(6, (r.gross / maxGross) * 160)}px` }}
              />
              <p className="text-[11px] font-bold text-slate-500">Year {r.year}</p>
            </div>
          ))}
        </div>
      </div>

      {/* readouts */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Year-1 ad sales
          </p>
          <p className="text-lg font-black text-slate-900">{usd(rows[0].adSales)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Year-5 gross
          </p>
          <p className="text-lg font-black text-slate-900">{usd(rows[YEARS - 1].gross)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Year-5 net
          </p>
          <p className="text-lg font-black text-emerald-700">{usd(rows[YEARS - 1].net)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            5-yr total gross
          </p>
          <p className="text-lg font-black text-slate-900">{usd(totalGross)}</p>
        </div>
      </div>

      {/* invest slider */}
      <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-bold text-emerald-900">
            💵 If you invest…
          </span>
          <span className="text-xl font-black text-emerald-700">{usd(invest)}</span>
        </div>
        <input
          type="range"
          min={5000}
          max={RAISE}
          step={1000}
          value={invest}
          onChange={(e) => setInvest(Number(e.target.value))}
          className="mt-2 w-full accent-emerald-600"
          aria-label="Investment amount"
        />
        <div className="mt-1 flex flex-wrap gap-2">
          {[5000, 10000, 25000, 50000].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setInvest(p)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                invest === p
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-emerald-300 bg-white text-emerald-800 hover:border-emerald-500"
              }`}
            >
              {usd(p)}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-emerald-900">
          That&apos;s <b>{num(sharePct, 0)}% of the $50,000 raise</b> —{" "}
          <b>≈{num((invest / POST_MONEY) * 100)}% of GoDesi</b> at the{" "}
          {usd(POST_MONEY)} post-money valuation. Exact structure (equity,
          profit-share or loan) is agreed per investor and put in writing with
          a lawyer.
        </p>
      </div>
    </div>
  );
}
