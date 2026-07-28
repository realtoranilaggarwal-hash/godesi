"use client";

import { useEffect, useState } from "react";

/** Long directory and admin pages need a way back up without endless scrolling. */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-24 left-4 z-40 rounded-full border border-slate-200 bg-white/95 px-3 py-2 text-sm font-bold text-slate-700 shadow-lg backdrop-blur hover:bg-white sm:bottom-6"
    >
      ↑ Top
    </button>
  );
}
