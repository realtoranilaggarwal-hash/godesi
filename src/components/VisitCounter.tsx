"use client";

import { useEffect, useState } from "react";

const KEY = "godesi_counted_on";

/**
 * The "visitors so far" line in the footer. One ping per page view; the device
 * only adds to the visitor count once a day, kept in the browser's own storage
 * so nothing about the person is stored on our side.
 */
export function VisitCounter() {
  const [totals, setTotals] = useState<{
    views: number;
    visitors: number;
  } | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    let first = true;
    try {
      first = window.localStorage.getItem(KEY) !== today;
      if (first) window.localStorage.setItem(KEY, today);
    } catch {
      /* private mode: count it as a fresh visitor */
    }

    let live = true;
    fetch("/api/visits", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ first }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (live && data) setTotals(data);
      })
      .catch(() => {
        /* a counter is never worth an error on screen */
      });

    return () => {
      live = false;
    };
  }, []);

  if (!totals) return null;

  return (
    <p className="text-xs text-slate-500">
      <span aria-hidden>👀</span>{" "}
      <strong className="font-semibold text-slate-700">
        {totals.views.toLocaleString()}
      </strong>{" "}
      page views from{" "}
      <strong className="font-semibold text-slate-700">
        {totals.visitors.toLocaleString()}
      </strong>{" "}
      visitors since launch
    </p>
  );
}
