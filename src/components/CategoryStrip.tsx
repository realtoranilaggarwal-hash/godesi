"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

export type StripItem = {
  href: string;
  label: string;
  icon: string;
  className: string;
};

/**
 * Horizontal category rail with arrow controls, so it reads as scrollable
 * instead of looking like a clipped list.
 */
export function CategoryStrip({ items }: { items: StripItem[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  const sync = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const max = rail.scrollWidth - rail.clientWidth;
    setAtStart(rail.scrollLeft <= 2);
    setAtEnd(rail.scrollLeft >= max - 2);
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [sync]);

  function scrollBy(direction: 1 | -1) {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * rail.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <div className="relative">
      {!atStart ? (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white to-transparent" />
          <button
            type="button"
            aria-label="Scroll categories left"
            onClick={() => scrollBy(-1)}
            className="absolute left-1 top-1/2 z-20 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-1 text-slate-600 shadow-sm hover:bg-slate-50"
          >
            <span aria-hidden>‹</span>
          </button>
        </>
      ) : null}

      <div
        ref={railRef}
        onScroll={sync}
        className="no-scrollbar mx-auto flex max-w-7xl gap-2 overflow-x-auto scroll-smooth px-4 py-2 text-xs font-semibold"
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 ${item.className}`}
          >
            {item.icon} {item.label}
          </Link>
        ))}
      </div>

      {!atEnd ? (
        <>
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white to-transparent" />
          <button
            type="button"
            aria-label="Scroll categories right"
            onClick={() => scrollBy(1)}
            className="absolute right-1 top-1/2 z-20 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-1 text-slate-600 shadow-sm hover:bg-slate-50"
          >
            <span aria-hidden>›</span>
          </button>
        </>
      ) : null}
    </div>
  );
}
