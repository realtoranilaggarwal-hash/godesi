"use client";

import { useState, useTransition } from "react";
import { voteDesignAction } from "@/app/actions/designPoll";
import { DESIGN_VOTES, type DesignTally, type DesignVoteKey } from "@/lib/designVotes";
import { RedesignCallLine } from "@/components/website/RedesignInquiryForm";

/** "Which design do you like better?" under one before/after card. */
export function DesignPoll({
  projectId,
  initialTally,
  alreadyVoted,
}: {
  projectId: string;
  initialTally: DesignTally;
  alreadyVoted: boolean;
}) {
  const [tally, setTally] = useState(initialTally);
  const [voted, setVoted] = useState(alreadyVoted);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const total = tally.NEW + tally.OLD + tally.NEEDS_WORK;

  function vote(key: DesignVoteKey) {
    setError(null);
    start(async () => {
      const result = await voteDesignAction({ projectId, vote: key, comment });
      if (result.ok) {
        setTally(result.tally);
        setVoted(true);
      } else setError(result.error);
    });
  }

  if (voted) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-500">
          Thanks for voting · {total} vote{total === 1 ? "" : "s"}
        </p>
        <div className="space-y-1">
          {DESIGN_VOTES.map((option) => {
            const pct = total ? Math.round((tally[option.key] / total) * 100) : 0;
            return (
              <div
                key={option.key}
                className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700"
              >
                <span className="absolute inset-y-0 left-0 bg-indigo-100" style={{ width: `${pct}%` }} />
                <span className="relative flex justify-between gap-2">
                  <span>{option.label}</span>
                  <span>{pct}%</span>
                </span>
              </div>
            );
          })}
        </div>
        <RedesignCallLine className="rounded-xl bg-amber-50 px-3 py-2" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-bold text-slate-900">Which design do you like better?</p>
      <div className="grid grid-cols-3 gap-2">
        {DESIGN_VOTES.map((option) => (
          <button
            key={option.key}
            type="button"
            disabled={pending}
            onClick={() => vote(option.key)}
            className="min-w-0 rounded-xl border border-slate-300 bg-white px-2 py-2 text-xs font-bold text-slate-800 hover:border-indigo-500 hover:bg-indigo-50 disabled:opacity-60"
          >
            {option.label}
          </button>
        ))}
      </div>
      <input
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        maxLength={140}
        placeholder="Optional: one line on why"
        aria-label="Optional comment"
        className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-500"
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
