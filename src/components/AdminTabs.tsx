"use client";

import { useEffect, useState } from "react";

export type AdminTab = { id: string; label: string; count?: number };

/**
 * Sticky jump bar for the long admin page: clicking a tab scrolls to that
 * section and the tab for the section on screen stays highlighted.
 */
export function AdminTabs({ tabs }: { tabs: AdminTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");

  useEffect(() => {
    const sections = tabs
      .map((tab) => document.getElementById(tab.id))
      .filter((element): element is HTMLElement => Boolean(element));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-120px 0px -60% 0px" },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [tabs]);

  return (
    <nav className="sticky top-16 z-30 -mx-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white/95 px-1 py-2 shadow-sm backdrop-blur">
      <ul className="flex w-max gap-1.5">
        {tabs.map((tab) => (
          <li key={tab.id}>
            <a
              href={`#${tab.id}`}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                active === tab.id
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
              {tab.count ? (
                <span
                  className={`rounded-full px-1.5 text-[10px] ${
                    active === tab.id
                      ? "bg-white/25"
                      : "bg-rose-100 text-rose-600"
                  }`}
                >
                  {tab.count}
                </span>
              ) : null}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
