"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const KEY = "godesi_page_viewed";

/**
 * "👁 1,234 views" under every page. A browser tab adds to a page's total
 * once; reloads and back-navigation only read it. Bots driving a browser
 * (navigator.webdriver) are never counted.
 */
export function PageViewCount() {
  const pathname = usePathname();
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    if (!pathname) return;
    setViews(null);
    let seen: string[] = [];
    try {
      seen = JSON.parse(window.sessionStorage.getItem(KEY) ?? "[]") as string[];
    } catch {
      /* storage blocked: count this view */
    }
    const count = !seen.includes(pathname) && !navigator.webdriver;
    if (count) {
      try {
        window.sessionStorage.setItem(KEY, JSON.stringify([...seen, pathname].slice(-200)));
      } catch {
        /* storage blocked */
      }
    }
    const controller = new AbortController();
    fetch("/api/page-views", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: pathname, count }),
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
