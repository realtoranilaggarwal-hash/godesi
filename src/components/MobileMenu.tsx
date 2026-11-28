"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { StripItem } from "@/components/CategoryStrip";
import { CategoryPicker, type PickerGroup } from "@/components/CategoryPicker";

export type MenuLink = { href: string; label: string; icon: string };

/**
 * One menu button holds the whole site: pages, account and every category, so the
 * header stays a single uncluttered line on phone and desktop alike.
 */
export function MobileMenu({
  links,
  categories,
  groups,
  account,
  signOut,
}: {
  links: MenuLink[];
  categories: StripItem[];
  /** The full taxonomy, so a phone can walk down the tree and pick. */
  groups: PickerGroup[];
  account: { href: string; label: string } | null;
  signOut: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState(false);
  const close = () => setOpen(false);

  // Pointing hand under ☰ until a visitor opens the menu once, so they know the categories live there.
  useEffect(() => {
    if (!localStorage.getItem("godesi-menu-seen")) setHint(true);
  }, []);
  const toggle = () => {
    setOpen((value) => !value);
    if (hint) {
      setHint(false);
      localStorage.setItem("godesi-menu-seen", "1");
    }
  };

  return (
    <div>
      <span className="relative inline-block">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-label={
            open ? "Close menu" : "Open menu: all pages and categories"
          }
          className="rounded-xl border border-slate-300 px-2.5 py-1.5 text-lg leading-none text-slate-700"
        >
          {open ? "✕" : "☰"}
        </button>
        {hint && !open ? (
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-full z-40 mt-1 -translate-x-1/2 animate-bounce whitespace-nowrap rounded-full bg-amber-400 px-2 py-0.5 text-xs font-black text-slate-900 shadow"
          >
            👆 Menu
          </span>
        ) : null}
      </span>

      {open ? (
        <div className="absolute inset-x-0 top-full max-h-[calc(100vh-8rem)] supports-[height:100dvh]:max-h-[calc(100dvh-8rem)] overflow-y-auto overscroll-contain border-t border-slate-200 bg-white shadow-lg">
          {account ? (
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-2 text-sm font-semibold">
              <Link
                href={account.href}
                onClick={close}
                className="text-indigo-600"
              >
                👤 {account.label}
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-xl border border-rose-300 px-3 py-1 text-rose-700 hover:bg-rose-50"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-2 text-sm font-semibold sm:hidden">
              <Link
                href="/login"
                onClick={close}
                className="rounded-xl border border-slate-300 px-3 py-2 text-slate-700"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                onClick={close}
                className="rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-3 py-2 text-white"
              >
                List free
              </Link>
            </div>
          )}

          <nav className="grid grid-cols-4 gap-1 px-2 py-2 text-[10px] font-semibold leading-tight sm:grid-cols-6 sm:gap-2 sm:px-4 sm:text-xs">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className="flex flex-col items-center justify-center gap-0.5 rounded-lg bg-slate-900 px-1 py-1 text-center text-white hover:bg-slate-700"
              >
                <span aria-hidden className="text-sm leading-none sm:text-base">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-slate-100 px-4 py-3 lg:hidden">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Categories
            </p>
            {groups.length ? (
              <CategoryPicker
                groups={groups}
                quickCount={6}
                onNavigate={close}
              />
            ) : (
              <div className="grid grid-cols-1 gap-1.5 text-xs font-semibold sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    className={`rounded-xl px-3 py-2 ${item.className}`}
                  >
                    {item.icon} {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
