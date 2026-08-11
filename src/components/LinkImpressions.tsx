"use client";

import { useEffect } from "react";

/** One beacon per box, so a page view costs each shown link exactly one view. */
export function LinkImpressions({ ids }: { ids: string[] }) {
  const key = ids.join(",");

  useEffect(() => {
    if (!key) return;
    const body = JSON.stringify({ ids: key.split(",") });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/links/impression",
        new Blob([body], { type: "application/json" }),
      );
      return;
    }
    void fetch("/api/links/impression", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  }, [key]);

  return null;
}
