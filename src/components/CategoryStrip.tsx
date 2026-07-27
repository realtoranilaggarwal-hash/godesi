"use client";

import { useState } from "react";
import Link from "next/link";

export type StripItem = {
  href: string;
  label: string;
  icon: string;
  className: string;
};

/**
 * Category chips wrap onto as many rows as they need, so nothing is hidden
 * behind a horizontal scroll. On narrow screens the rows are clamped to two
 * until the visitor expands them, keeping the header from eating the viewport.
 */
export function CategoryStrip({ items }: { items: StripItem[] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mx-auto max-w-7xl px-4 py-2">
      <div
        className={`flex flex-wrap gap-1.5 text-[11px] font-semibold sm:text-xs ${
          expanded ? "" : "max-h-[3.6rem] overflow-hidden sm:max-h-none"
        }`}
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 ${item.className}`}
          >
            {item.icon} {item.label}
          </Link>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className="mt-1 text-[11px] font-bold text-indigo-600 sm:hidden"
      >
        {expanded ? "Show less ▴" : "All categories ▾"}
      </button>
    </div>
  );
}
