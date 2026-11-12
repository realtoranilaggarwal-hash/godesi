"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

const TABS = [
  { href: "/dashboard", label: "🏠 Dashboard" },
  { href: "/dashboard/plan", label: "My plan" },
  { href: "/dashboard/listings", label: "My listings" },
  { href: "/dashboard/rewards", label: "Refer & earn" },
  { href: "/dashboard/notifications", label: "Notifications" },
  { href: "/leads", label: "Browse leads" },
];

/** Member account tabs; the page you are on stays highlighted. */
export function DashboardTabs({ children }: { children?: ReactNode }) {
  const pathname = usePathname();
  const nav = useRef<HTMLElement>(null);

  useEffect(() => {
    const bar = nav.current;
    const current = bar?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!bar || !current || bar.scrollWidth <= bar.clientWidth) return;
    bar.scrollLeft =
      current.offsetLeft - (bar.clientWidth - current.offsetWidth) / 2;
  }, [pathname]);

  return (
    <nav
      ref={nav}
      aria-label="My account"
      className="relative flex min-w-0 items-center gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0"
    >
      {TABS.map((tab) => {
        const active =
          tab.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-semibold transition ${
              active
                ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
      {children ? <div className="shrink-0">{children}</div> : null}
    </nav>
  );
}
