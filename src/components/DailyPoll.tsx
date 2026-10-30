"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { votePollAction } from "@/app/actions/poll";
import type { PollState } from "@/lib/poll";

export function DailyPoll({
  initial,
  signedIn,
}: {
  initial: PollState;
  signedIn: boolean;
}) {
  const [state, setState] = useState(initial);
  const [pending, start] = useTransition();
  const voted = state.myChoice != null;

  function vote(choice: number) {
    start(async () => {
      const result = await votePollAction(state.id, choice);
      if (result.ok) setState(result.state);
    });
  }

  return (
    <section className="rounded-3xl border-2 border-orange-200 bg-white px-4 py-3 shadow-sm sm:px-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-black text-slate-900">
          🗳️ Today&apos;s question — {state.text}
        </h2>
        <span className="text-[11px] font-semibold text-slate-500">
          {state.total} vote{state.total === 1 ? "" : "s"}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {state.options.map((option, index) => {
          const count = state.tallies[index] ?? 0;
          const pct = state.total ? Math.round((count / state.total) * 100) : 0;
          if (voted) {
            const mine = state.myChoice === index;
            return (
              <div
                key={option}
                className={`relative overflow-hidden rounded-full border px-3 py-1.5 text-xs font-bold ${
                  mine
                    ? "border-orange-500 bg-orange-50 text-orange-700"
                    : "border-slate-200 bg-slate-50 text-slate-600"
                }`}
              >
                <span
                  className="absolute inset-y-0 left-0 bg-orange-100"
                  style={{ width: `${pct}%` }}
                />
                <span className="relative">
                  {mine ? "✓ " : ""}
                  {option} · {pct}%
                </span>
              </div>
            );
          }
          if (!signedIn) {
            return (
              <Link
                key={option}
                href="/signup?next=/"
                className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700 transition hover:bg-orange-100"
              >
                {option}
              </Link>
            );
          }
          return (
            <button
              key={option}
              type="button"
              disabled={pending}
              onClick={() => vote(index)}
              className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700 transition hover:bg-orange-100 disabled:opacity-60"
            >
              {option}
            </button>
          );
        })}
      </div>
      {!signedIn ? (
        <p className="mt-1.5 text-[11px] text-slate-500">
          <Link href="/signup?next=/" className="font-bold text-orange-600 underline">
            Join free
          </Link>{" "}
          to vote and earn 5 points daily.
        </p>
      ) : voted ? (
        <p className="mt-1.5 text-[11px] text-emerald-600">
          +5 points! A new question lands tomorrow.
        </p>
      ) : null}
    </section>
  );
}
