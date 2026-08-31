"use client";

import { useEffect } from "react";

const KEY = "godesi_counted_on";

/**
 * Records the page view in our own counter, which is the fallback behind the
 * footer number if the analytics share link ever stops answering. Renders
 * nothing; a device only adds to the visitor count once a day, kept in the
 * browser's own storage so nothing about the person is stored on our side.
 */
export function VisitPing() {
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    let first = true;
    try {
      first = window.localStorage.getItem(KEY) !== today;
      if (first) window.localStorage.setItem(KEY, today);
    } catch {
      /* private mode: count it as a fresh visitor */
    }

    fetch("/api/visits", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ first }),
      keepalive: true,
    }).catch(() => {
      /* a counter is never worth an error on screen */
    });
  }, []);

  return null;
}
