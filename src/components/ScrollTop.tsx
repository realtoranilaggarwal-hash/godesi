"use client";

import { useEffect } from "react";

/** Forces the page to open at the top — iOS Safari keeps the previous
 *  page's scroll position after client-side navigation, and
 *  `overflow-x-hidden` on <html> can make window.scrollTo a no-op,
 *  so scroll every possible scroller, briefly repeated while the
 *  streamed page content settles. With a #hash it scrolls to that
 *  element instead. */
export function ScrollTop() {
  useEffect(() => {
    /** A link like /events/x#tickets should land on that section, not the top. */
    const hash = decodeURIComponent(window.location.hash.slice(1));
    const top = () => {
      const target = hash ? document.getElementById(hash) : null;
      if (target) {
        /** A collapsed section linked by #id (e.g. #sponsor) opens on arrival. */
        if (target instanceof HTMLDetailsElement) target.open = true;
        target.scrollIntoView({ block: "start", behavior: "auto" });
        return;
      }
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
