"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const KEY = "godesi_page_viewed";
const CONSENT_KEY = "godesi_cookie_consent";
const BAZAAR_HOSTS = new Set(["oaktreebazaar.com", "www.oaktreebazaar.com"]);

/**
 * "👁 1,234 views" under every page. A browser tab adds to a page's total
 * once; reloads and back-navigation only read it. Bots driving a browser
 * (navigator.webdriver) and visitors who chose "Essential only" are never
 * counted, though they still see the total.
 */
export function PageViewCount() {
  const pathname = usePathname();
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    if (!pathname) return;
    setViews(null);
    const path = BAZAAR_HOSTS.has(window.location.hostname)
      ? `/bazaar${pathname === "/" ? "" : pathname}`
      : pathname;
    let seen: string[] = [];
    let optedOut = false;
    try {
      seen = JSON.parse(window.sessionStorage.getItem(KEY) ?? "[]") as string[];
      optedOut = window.localStorage.getItem(CONSENT_KEY) === "rejected";
    } catch {
      /* storage blocked: count this view */
    }
    const count = !seen.includes(path) && !navigator.webdriver && !optedOut;
    if (count) {
      try {
        window.sessionStorage.setItem(KEY, JSON.stringify([...seen, path].slice(-200)));
      } catch {
        /* storage blocked */
      }
    }
    const controller = new AbortController();
    fetch("/api/page-views", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path, count }),
      signal: controller.signal,
    })
      .then((r) => (r.ok ? (r.json() as Promise<{ views?: number }>) : null))
      .then((data) => setViews(data?.views ?? 0))
      .catch(() => {
        /* a counter is never worth an error on screen */
      });
    return () => controller.abort();
  }, [pathname]);

  if (!views) return null;
  return (
    <p className="mt-6 text-right text-xs text-slate-500">
      <span aria-hidden>👁</span>{" "}
      <strong className="font-semibold text-slate-700">{views.toLocaleString()}</strong>{" "}
      {views === 1 ? "view" : "views"}
    </p>
  );
}
