"use client";

import { useEffect, useState, type ReactNode } from "react";
import { CategoryStrip, type StripItem } from "@/components/CategoryStrip";

/**
 * Wide screens get the full category strip; once you scroll it folds into a
 * dropdown, and on narrow screens it lives in the menu button instead.
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
    /** Hysteresis: collapsing shortens the header, so a single threshold flickered. */
    const onScroll = () => {
      setScrolled((past) => {
        const next = past ? window.scrollY > 80 : window.scrollY > 200;
        if (!next) setOpen(false);
        return next;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div
        className={scrolled ? "[&_img]:!h-7" : undefined}
      >
        {bar}
      </div>

      {scrolled ? (
        <div className="relative hidden border-t border-slate-100 lg:block">
          <div className="mx-auto max-w-screen-2xl px-4">
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
        <div className="hidden border-t border-slate-100 bg-white lg:block">
          <CategoryStrip items={items} />
        </div>
      )}
    </header>
  );
}
