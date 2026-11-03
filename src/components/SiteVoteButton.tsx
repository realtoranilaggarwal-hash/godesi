"use client";

import { useEffect, useState } from "react";

/** One tap per visitor; remembered in localStorage, enforced server-side. */
export function SiteVoteButton({ siteKey, count }: { siteKey: string; count: number }) {
  const storageKey = `site-vote:${siteKey}`;
  const [voted, setVoted] = useState(false);
  // The server count is cached for minutes, so a fresh vote is added locally.
  const [justVoted, setJustVoted] = useState(false);

  useEffect(() => {
    setVoted(localStorage.getItem(storageKey) === "1");
  }, [storageKey]);

  function vote() {
    if (voted) return;
    setVoted(true);
    setJustVoted(true);
    localStorage.setItem(storageKey, "1");
    fetch("/api/site-votes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ siteKey }),
    }).catch(() => undefined);
  }

  return (
    <button
      type="button"
      onClick={vote}
      disabled={voted}
      title={voted ? "Thanks for voting" : "Vote: this site is useful"}
      aria-label={voted ? "You voted for this site" : "Vote: this site is useful"}
      className={`flex w-12 flex-none flex-col items-center rounded-lg border px-1 py-1 text-xs font-bold leading-tight ${
        voted
          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-700"
      }`}
    >
      <span aria-hidden>▲</span>
      {count + (justVoted ? 1 : 0)}
    </button>
  );
}
