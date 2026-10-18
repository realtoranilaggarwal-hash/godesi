"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export type StripItem = {
  href: string;
  label: string;
  icon: string;
  className: string;
  /** Id of the `StripGroup` dropdown this chip sits in; ungrouped chips show on the bar. */
  group?: string;
};

export type StripGroup = { id: string; label: string; icon: string };

export type StripLink = { href: string; label: string; icon: string };

/**
 * One line of section buttons that swipes sideways on phones. Each section opens
 * a panel of its category chips under the line, so the header stays one row tall.
 */
export function CategoryStrip({
  items,
  groups = [],
  links = [],
}: {
  items: StripItem[];
  groups?: StripGroup[];
  /** Plain page links after the section buttons. */
  links?: StripLink[];
}) {
  const [open, setOpen] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(null);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const loose = items.filter((item) => !item.group);
  const sections = groups
    .map((group) => ({
      ...group,
      items: items.filter((item) => item.group === group.id),
    }))
    .filter((section) => section.items.length);
  const current = sections.find((section) => section.id === open);

  return (
    <div ref={ref} className="mx-auto max-w-screen-2xl px-4 py-2">
      <div className="flex gap-1.5 overflow-x-auto whitespace-nowrap text-[11px] font-semibold [scrollbar-width:none] sm:text-xs [&::-webkit-scrollbar]:hidden">
        {loose.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 ${item.className}`}
          >
            {item.icon} {item.label}
          </Link>
        ))}
        {sections.map((section) => {
          const active = section.id === open;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setOpen(active ? null : section.id)}
              aria-expanded={active}
              aria-controls="category-strip-panel"
              className={`shrink-0 rounded-full border px-2.5 py-1 sm:px-3 sm:py-1.5 ${
                active
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
              }`}
            >
              {section.icon} {section.label} {active ? "▴" : "▾"}
            </button>
          );
        })}
        {links.length ? (
          <span aria-hidden className="mx-1 w-px shrink-0 bg-slate-200" />
        ) : null}
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-slate-700 hover:bg-slate-200 sm:px-3 sm:py-1.5"
          >
            {link.icon} {link.label}
          </Link>
        ))}
      </div>

      {current ? (
        <div
          id="category-strip-panel"
          className="mt-2 flex flex-wrap gap-1.5 rounded-2xl border border-slate-200 bg-white p-2 text-[11px] font-semibold shadow-sm sm:text-xs"
        >
          {current.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(null)}
              className={`whitespace-nowrap rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 ${item.className}`}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
