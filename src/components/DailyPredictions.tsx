"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { pickPredictionAction } from "@/app/actions/predict";
import type { MarketState } from "@/lib/predictions";

const LABELS = ["📈 Up", "📉 Down"];

export function DailyPredictions({
  initial,
  signedIn,
}: {
  initial: MarketState[];
  signedIn: boolean;
}) {
  const [markets, setMarkets] = useState(initial);
  const [pending, start] = useTransition();

  function pick(marketId: string, choice: number) {
    start(async () => {
      const result = await pickPredictionAction(marketId, choice);
      if (result.ok) setMarkets(result.markets);
    });
  }

  return (
    <section className="rounded-3xl border-2 border-emerald-200 bg-white px-4 py-3 shadow-sm sm:px-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-black text-slate-900">
          🎯 Daily prediction — call it right, win 10 points
        </h2>
        <span className="text-[11px] font-semibold text-slate-500">
          Settles after tonight&apos;s close · wrong call −5
        </span>
      </div>
      <div className="mt-2 space-y-2">
        {markets.map((market) => (
          <div
            key={market.id}
            className="flex flex-wrap items-center gap-2 rounded-2xl bg-emerald-50/60 px-3 py-2"
          >
            <span className="min-w-0 flex-1 text-xs font-bold text-slate-800">
              {market.question}
            </span>
            <span className="flex items-center gap-1.5">
              {LABELS.map((label, index) => {
                const count = market.tallies[index] ?? 0;
                const pct = market.total
                  ? Math.round((count / market.total) * 100)
                  : 0;
                if (market.myChoice != null) {
                  const mine = market.myChoice === index;
                  return (
                    <span
                      key={label}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                        mine
                          ? "border-emerald-500 bg-emerald-100 text-emerald-800"
                          : "border-slate-200 bg-white text-slate-500"
                      }`}
                    >
                      {mine ? "✓ " : ""}
                      {label} {pct}%
                    </span>
                  );
                }
                if (!signedIn) {
                  return (
                    <Link
                      key={label}
                      href="/signup?next=/"
                      className="rounded-full border border-emerald-300 bg-white px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50"
                    >
                      {label}
                    </Link>
                  );
                }
                return (
                  <button
                    key={label}
                    type="button"
                    disabled={pending}
                    onClick={() => pick(market.id, index)}
                    className="rounded-full border border-emerald-300 bg-white px-2.5 py-1 text-[11px] font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-60"
                  >
                    {label}
                  </button>
                );
              })}
            </span>
          </div>
        ))}
      </div>
      {!signedIn ? (
        <p className="mt-1.5 text-[11px] text-slate-500">
          <Link href="/signup?next=/" className="font-bold text-emerald-700 underline">
            Join free
          </Link>{" "}
          to play — new markets every day.
        </p>
      ) : null}
    </section>
  );
}
