"use client";

import { useEffect, useState, type ReactNode } from "react";

/** Keeps the header out of the way once you start reading: one row that slims on scroll. */
export function HeaderShell({ bar }: { bar: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div
        className={scrolled ? "[&_img]:!h-7 [&>div]:!py-1.5" : "transition-all"}
      >
        {bar}
      </div>
    </header>
  );
}
