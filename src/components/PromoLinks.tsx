"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { StripLink } from "@/components/CategoryStrip";

/**
 * A one-row line of chips: chips that wrap onto a hidden second row are made
 * `invisible` (out of the tab order), and "More" lists every link.
 */
export function PromoLinks({
  links,
  more,
}: {
  links: StripLink[];
  /** Extra links listed only in the "More" menu. */
  more: StripLink[];
}) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const measure = () => {
      const top = nav.getBoundingClientRect().top;
      const next = new Set<string>();
      nav.querySelectorAll<HTMLElement>("[data-href]").forEach((chip) => {
        if (chip.getBoundingClientRect().top - top > 4) {
          next.add(chip.dataset.href ?? "");
        }
      });
      setHidden(next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <nav
        ref={navRef}
        aria-label="Popular on GoDesi"
        className="hidden h-8 min-w-0 flex-1 flex-wrap content-start items-center gap-x-1 gap-y-4 overflow-hidden text-xs font-semibold lg:flex"
      >
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            data-href={item.href}
            className={`whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1.5 text-slate-700 hover:bg-slate-200 ${
              hidden.has(item.href) ? "invisible" : ""
            }`}
          >
            <span aria-hidden className="mr-1">
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div ref={menuRef} className="relative hidden shrink-0 lg:block">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
        >
          More {open ? "▴" : "▾"}
        </button>
        {open ? (
          <div className="absolute right-0 z-50 mt-2 grid w-96 grid-cols-2 gap-1 rounded-2xl border border-slate-200 bg-white p-2 text-xs font-semibold shadow-lg">
            {[...links, ...more].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="truncate rounded-lg px-2 py-1.5 text-slate-700 hover:bg-slate-100"
              >
                <span aria-hidden className="mr-1">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}
