"use client";

import { useState } from "react";
import Link from "next/link";
import type { StripItem } from "@/components/CategoryStrip";

export type MenuLink = { href: string; label: string; icon: string };

/**
 * Phone navigation: everything lives behind one button and rolls down on tap,
 * so the header stays a single line like a native app.
 */
export function MobileMenu({
  links,
  categories,
  account,
  signOut,
}: {
  links: MenuLink[];
  categories: StripItem[];
  account: { href: string; label: string } | null;
  signOut: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="rounded-xl border border-slate-300 px-2.5 py-1.5 text-lg leading-none text-slate-700"
      >
        {open ? "✕" : "☰"}
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-full max-h-[75vh] overflow-y-auto border-t border-slate-200 bg-white shadow-lg">
          <nav className="grid grid-cols-2 gap-2 px-4 py-3 text-sm font-semibold">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className="rounded-xl bg-slate-900 px-3 py-2 text-white"
              >
                <span aria-hidden className="mr-1">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </nav>

          {account ? (
            <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 text-sm font-semibold">
              <Link href={account.href} onClick={close} className="text-indigo-600">
                {account.label}
              </Link>
              <form action={signOut}>
                <button type="submit" className="text-slate-500">
                  Sign out
                </button>
              </form>
            </div>
          ) : null}

          <div className="border-t border-slate-100 px-4 py-3 md:hidden">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Categories
            </p>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold">
              {categories.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className={`whitespace-nowrap rounded-full px-2.5 py-1 ${item.className}`}
                >
                  {item.icon} {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
