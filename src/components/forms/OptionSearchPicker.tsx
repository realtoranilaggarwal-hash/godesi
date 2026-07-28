"use client";

import { useMemo, useState } from "react";
import type { OptionBundle, OptionTab } from "@/lib/specialties";

/**
 * Searchable, tabbed multi-select for long option lists (e.g. 50+ IT courses).
 * Selections post as normal checkboxes under `name`, so the server sees the
 * same shape as a plain checkbox list.
 */
export function OptionSearchPicker({
  name,
  tabs,
  bundles,
  defaultSelected = [],
  onSelectionChange,
}: {
  name: string;
  tabs: OptionTab[];
  bundles?: OptionBundle[];
  defaultSelected?: string[];
  /** Lets the parent react, e.g. to offer a featured badge from the picks. */
  onSelectionChange?: (selected: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>(defaultSelected);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState(tabs[0]?.title ?? "");

  const update = (next: string[]) => {
    setSelected(next);
    onSelectionChange?.(next);
  };

  const search = query.trim().toLowerCase();
  const visible = useMemo(() => {
    if (search) {
      return tabs
        .map((entry) => ({
          title: entry.title,
          options: entry.options.filter((option) =>
            option.toLowerCase().includes(search),
          ),
        }))
        .filter((entry) => entry.options.length);
    }
    const active = tabs.find((entry) => entry.title === tab) ?? tabs[0];
    return active ? [active] : [];
  }, [search, tab, tabs]);

  const toggle = (option: string) =>
    update(
      selected.includes(option)
        ? selected.filter((value) => value !== option)
        : [...selected, option],
    );

  const addAll = (options: string[]) =>
    update(Array.from(new Set([...selected, ...options])));

  return (
    <div className="space-y-3">
      {/* Every pick is submitted here so the visible list can stay filtered. */}
      {selected.map((option) => (
        <input key={option} type="hidden" name={name} value={option} />
      ))}

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search — e.g. data, aws, sap"
          className="min-w-[12rem] flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm"
          aria-label="Search options"
        />
        {selected.length ? (
          <button
            type="button"
            onClick={() => update([])}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600"
          >
            Clear all
          </button>
        ) : null}
      </div>

      {selected.length ? (
        <div className="sticky top-2 z-10 rounded-xl border border-emerald-200 bg-emerald-50/95 p-2">
          <p className="text-xs font-bold text-emerald-900">
            Selected ({selected.length})
          </p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {selected.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => toggle(option)}
                className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-emerald-800 shadow-sm"
              >
                {option} ✕
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {bundles?.length ? (
        <div className="flex flex-wrap gap-1.5">
          {bundles.map((bundle) => (
            <button
              key={bundle.title}
              type="button"
              onClick={() => addAll(bundle.options)}
              className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
            >
              + {bundle.title}
            </button>
          ))}
        </div>
      ) : null}

      {search ? null : (
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((entry) => (
            <button
              key={entry.title}
              type="button"
              onClick={() => setTab(entry.title)}
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                entry.title === (tab || tabs[0]?.title)
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200"
              }`}
            >
              {entry.title}
            </button>
          ))}
        </div>
      )}

      {visible.map((entry) => (
        <div key={entry.title} className="rounded-xl bg-white/70 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-slate-800">{entry.title}</p>
            <button
              type="button"
              onClick={() => addAll(entry.options)}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              Select all
            </button>
          </div>
          <div className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
            {entry.options.map((option) => (
              <label
                key={option}
                className="flex items-start gap-2 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => toggle(option)}
                  className="mt-0.5 h-4 w-4"
                />
                {option}
              </label>
            ))}
          </div>
        </div>
      ))}

      {search && !visible.length ? (
        <p className="text-sm text-slate-500">No match for “{query}”.</p>
      ) : null}
    </div>
  );
}
