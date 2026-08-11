"use client";

import { useEffect } from "react";

/** Counts one impression per banner per page view, from the browser. */
export function BannerImpression({ id }: { id: string }) {
  useEffect(() => {
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
  }, [id]);

  return null;
}
