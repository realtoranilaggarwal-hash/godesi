"use client";

import { useEffect, useState, type ReactNode } from "react";
import { CategoryStrip, type StripItem } from "@/components/CategoryStrip";

/**
 * Keeps the header out of the way once you start reading: the bar slims down and
 * the category chips fold into a dropdown instead of holding two sticky rows.
 */
export function HeaderShell({
  bar,
  items,
}: {
  bar: ReactNode;
  items: StripItem[];
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const past = window.scrollY > 120;
      setScrolled(past);
      if (!past) setOpen(false);
    };
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

      {scrolled ? (
        <div className="relative hidden border-t border-slate-100 md:block">
          <div className="mx-auto max-w-7xl px-4">
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              className="py-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              🧭 Categories {open ? "▴" : "▾"}
            </button>
          </div>
          {open ? (
            <div className="absolute inset-x-0 top-full border-b border-slate-200 bg-white shadow-lg">
              <CategoryStrip items={items} />
            </div>
          ) : null}
        </div>
      ) : (
        <div className="hidden border-t border-slate-100 bg-white md:block">
          <CategoryStrip items={items} />
        </div>
      )}
    </header>
  );
}
