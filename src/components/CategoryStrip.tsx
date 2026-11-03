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
  /** Sub-pages listed under this chip when its section is open. */
  children?: { href: string; label: string }[];
};

export type StripGroup = {
  id: string;
  label: string;
  icon: string;
  /** Page the section opens from; a section with no items is a plain link to it. */
  href?: string;
};

export type StripLink = { href: string; label: string; icon: string };

/**
 * One line of section buttons that swipes sideways on phones. Each section opens
 * a panel under the line listing its pages, each with its sub-pages beneath it.
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
    .filter((section) => section.items.length || section.href);
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
          if (!section.items.length && section.href) {
            return (
              <Link
                key={section.id}
                href={section.href}
                className="shrink-0 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-slate-800 hover:bg-slate-50 sm:px-3 sm:py-1.5"
              >
                {section.icon} {section.label}
              </Link>
            );
          }
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
          className="mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 text-xs shadow-sm sm:text-sm"
        >
          {current.href ? (
            <Link
              href={current.href}
              onClick={() => setOpen(null)}
              className="mb-3 inline-block rounded-full bg-slate-900 px-3 py-1 font-bold text-white hover:bg-slate-700"
            >
              {current.icon} Open {current.label} →
            </Link>
          ) : null}
          <div className="columns-2 gap-4 sm:columns-3 lg:columns-5">
            {current.items.map((item) => (
              <div key={item.href} className="mb-3 min-w-0 break-inside-avoid">
                <Link
                  href={item.href}
                  onClick={() => setOpen(null)}
                  className="flex items-start gap-1 break-words font-bold text-slate-900 hover:text-indigo-700"
                >
                  <span aria-hidden>{item.icon}</span>
                  <span className="min-w-0">{item.label}</span>
                </Link>
                {item.children?.length ? (
                  <ul className="mt-1 space-y-0.5 border-l-2 border-slate-100 pl-2">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          onClick={() => setOpen(null)}
                          className="block break-words text-slate-600 hover:text-indigo-700"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
