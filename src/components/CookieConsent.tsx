"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "godesi_cookie_consent";

/**
 * Consent gate for non-essential cookies. Nothing analytical is loaded until a
 * choice is stored, and the choice itself lives in localStorage, not a cookie.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(KEY)) setVisible(true);
    } catch {
      // Storage blocked — stay silent rather than nagging on every page.
    }
  }, []);

  // The bar covers the bottom of the screen, where the floating buttons live.
  // `.fab-anchor` lifts them clear of it for as long as it is up.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("consent-open", visible);
    return () => root.classList.remove("consent-open");
  }, [visible]);

  function choose(value: "accepted" | "rejected") {
    try {
      window.localStorage.setItem(KEY, value);
    } catch {
      // Ignore: the banner simply reappears next visit.
    }
    window.dispatchEvent(new Event("godesi:cookie-consent"));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur sm:p-4">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-600 sm:text-sm">
          We use essential cookies to keep you signed in, and optional cookies
          to measure how ads and pages perform. Read our{" "}
          <Link
            href="/cookies"
            className="font-semibold text-indigo-600 underline"
          >
            cookie policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => choose("rejected")}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={() => choose("accepted")}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
