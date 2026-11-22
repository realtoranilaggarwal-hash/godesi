"use client";

import { useEffect } from "react";

/**
 * Counts one impression per banner per page view, from the browser. `media`
 * limits it to screens where that copy is shown (CSS-hidden twins skip it).
 */
export function BannerImpression({
  id,
  media,
}: {
  id: string;
  media?: string;
}) {
  useEffect(() => {
    if (media && !window.matchMedia(media).matches) return;
    const body = JSON.stringify({ id });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/banners/impression",
        new Blob([body], { type: "application/json" }),
      );
      return;
    }
    void fetch("/api/banners/impression", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  }, [id, media]);

  return null;
}
