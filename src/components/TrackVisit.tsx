"use client";

import { useEffect } from "react";

function referrerHost(): string {
  try {
    return document.referrer ? new URL(document.referrer).hostname : "";
  } catch {
    return "";
  }
}

export function TrackVisit({
  slug,
  fromQr,
  source,
}: {
  slug: string;
  fromQr: boolean;
  /** "sponsor" when the visitor clicked a sponsor logo (?src=sponsor). */
  source?: string;
}) {
  useEffect(() => {
    const key = `godesi:view:${slug}:${fromQr ? "qr" : (source ?? "web")}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    const referrer = referrerHost();
    const path = window.location.pathname;
    const send = (type: string) =>
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          type,
          referrer,
          path,
          source: fromQr ? "qr" : source,
        }),
        keepalive: true,
      }).catch(() => undefined);

    void send("PROFILE_VIEW");
    if (fromQr) void send("QR_SCAN");
  }, [slug, fromQr, source]);

  return null;
}
