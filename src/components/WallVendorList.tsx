"use client";

import { useMemo, useState } from "react";

export type WallVendor = {
  name: string;
  business: string | null;
  href: string;
  pixels: number;
  desc: string | null;
  category: string | null;
  points: number | null;
};

const TOP = 50;

const fold = (text: string) => text.toLowerCase().replace(/[-_]+/g, " ");

/** Wall of Fame vendor list, ranked by bricks, with instant search. */
export function WallVendorList({ vendors }: { vendors: WallVendor[] }) {
  const [query, setQuery] = useState("");
  const ranked = useMemo(
    () => vendors.map((vendor, index) => ({ vendor, rank: index + 1 })),
    [vendors],
  );
  const terms = fold(query).trim().split(/\s+/).filter(Boolean);
  const shown = terms.length
    ? ranked.filter(({ vendor }) => {
        const haystack = fold(
          [vendor.name, vendor.business, vendor.category].filter(Boolean).join(" "),
        );
        return terms.every((term) => haystack.includes(term));
      })
    : ranked.slice(0, TOP);

  return (
    <section className="rounded-3xl border border-amber-200 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-lg font-black text-slate-900">
            🏅 The Wall of Fame — vendor list
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Ranked by desi bricks owned — buy more, climb higher.
            {vendors.length > TOP && !terms.length
              ? ` Showing the top ${TOP} of ${vendors.length} — search to find anyone.`
              : ""}
          </p>
        </div>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, business or category"
          aria-label="Search the vendor list"
          className="w-full rounded-full border border-slate-200 px-4 py-2 text-sm focus:border-amber-400 focus:outline-none sm:w-72"
        />
      </div>
      {shown.length ? (
        <ol className="mt-3 divide-y divide-slate-100">
          {shown.map(({ vendor, rank }) => {
            const title = vendor.business ?? vendor.name;
            const byline =
              vendor.business && !fold(vendor.business).includes(fold(vendor.name))
                ? vendor.name
                : null;
            return (
              <li key={`${vendor.name}-${vendor.href}`}>
                <a
                  href={vendor.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 px-2 py-2.5 transition hover:bg-amber-50"
                >
                  <span className="w-8 shrink-0 text-lg font-black text-slate-400">
                    {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}.`}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="truncate font-bold text-slate-900">{title}</span>
                      {vendor.category ? (
                        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                          {vendor.category}
                        </span>
                      ) : null}
                    </span>
                    {byline ? (
                      <span className="block truncate text-xs font-semibold text-slate-600">
                        by {byline}
                      </span>
                    ) : null}
                    {vendor.desc ? (
                      <span className="mt-0.5 line-clamp-2 block text-xs font-normal text-slate-500">
                        {vendor.desc}
                      </span>
                    ) : null}
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <span className="rounded-full bg-amber-200/70 px-2.5 py-0.5 text-xs font-black text-amber-800">
                      {Math.floor(vendor.pixels / 100).toLocaleString()} bricks
                    </span>
                    {vendor.points !== null ? (
                      <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-black text-indigo-700">
                        {vendor.points.toLocaleString()} pts
                      </span>
                    ) : null}
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-indigo-600">
                    Visit →
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="mt-3 rounded-xl bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">
          No vendors match “{query}”.
        </p>
      )}
    </section>
  );
}
