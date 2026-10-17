"use client";

import { useState } from "react";

const PRESETS = [100, 500, 1000, 2000, 5000, 10000];

/** Dollars ↔ another currency at today's reference rate, both directions. */
export function RupeeConverter({
  perDollar,
  code,
}: {
  perDollar: number;
  code: string;
}) {
  const [usd, setUsd] = useState("1000");
  const dollars = Math.max(0, Number(usd) || 0);
  const format = (value: number, currency: string) =>
    new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);

  return (
    <div className="space-y-3">
      <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <label className="text-sm font-semibold">
          US dollars
          <input
            type="number"
            min="0"
            inputMode="decimal"
            value={usd}
            onChange={(event) => setUsd(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-lg"
          />
        </label>
        <span className="pb-2 text-center text-xl text-slate-400">→</span>
        <div className="text-sm font-semibold">
          {code}
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-lg font-black text-emerald-800">
            {format(dollars * perDollar, code)}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => setUsd(String(amount))}
            className="rounded-full border border-slate-200 px-3 py-1 text-sm hover:border-emerald-400"
          >
            ${amount.toLocaleString("en-US")}
          </button>
        ))}
      </div>
    </div>
  );
}
