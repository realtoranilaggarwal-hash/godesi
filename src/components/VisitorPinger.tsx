"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const KEY = "godesi_live_ping";
/**
 * The map counts a visitor for 30 minutes, so pinging on every page view only
 * writes rows the map already has. One ping per visitor per half hour.
 */
const EVERY_MS = 30 * 60_000;

/** Sends an anonymous ping so the live visitor map has data. */
export function VisitorPinger() {
  const pathname = usePathname();

  useEffect(() => {
    const last = Number(window.sessionStorage.getItem(KEY) ?? 0);
    if (Date.now() - last < EVERY_MS) return;

    // Stamped only once the ping is away, so a page left before the delay is
    // up does not silence this visitor for the next ten minutes.
    const timer = setTimeout(() => {
      window.sessionStorage.setItem(KEY, String(Date.now()));
      void fetch("/api/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pathname }),
        keepalive: true,
      }).catch(() => undefined);
    }, 1200);
    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
