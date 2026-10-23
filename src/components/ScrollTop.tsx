"use client";

import { useEffect } from "react";

/** Forces the page to open at the top — iOS Safari keeps the previous
 *  page's scroll position after client-side navigation, and
 *  `overflow-x-hidden` on <html> can make window.scrollTo a no-op,
 *  so scroll every possible scroller, briefly repeated while the
 *  streamed page content settles. */
export function ScrollTop() {
  useEffect(() => {
    const top = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      const el = document.scrollingElement;
      if (el) el.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    top();
    const timers = [
      setTimeout(top, 50),
      setTimeout(top, 200),
      setTimeout(top, 500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);
  return null;
}
