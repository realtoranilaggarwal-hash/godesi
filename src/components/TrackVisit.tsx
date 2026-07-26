"use client";

import { useEffect } from "react";

export function TrackVisit({ slug, fromQr }: { slug: string; fromQr: boolean }) {
  useEffect(() => {
    const key = `godesi:view:${slug}:${fromQr ? "qr" : "web"}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    const send = (type: string) =>
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, type }),
        keepalive: true,
      }).catch(() => undefined);

    void send("PROFILE_VIEW");
    if (fromQr) void send("QR_SCAN");
  }, [slug, fromQr]);

  return null;
}
