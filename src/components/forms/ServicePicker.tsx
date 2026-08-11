"use client";

import { useState } from "react";

export type ServiceGroup = { title: string; icon?: string; items: string[] };

/**
 * Tick-box category picker for requirement forms — the selection is submitted
 * as one readable `category` string so existing lead matching keeps working.
 */
export function ServicePicker({
  groups,
  defaultSelected = [],
  fallbackLabel,
  legend = "What are you looking for?",
  hint = "Tick everything you need.",
}: {
  groups: ServiceGroup[];
  defaultSelected?: string[];
  fallbackLabel: string;
  legend?: string;
  hint?: string;
}) {
  const [selected, setSelected] = useState<string[]>(defaultSelected);

  const toggle = (item: string) =>
    setSelected((current) =>
      current.includes(item)
        ? current.filter((value) => value !== item)
        : [...current, item],
    );

  return (
    <fieldset>
      <legend className="text-sm font-semibold text-slate-800">{legend}</legend>
      <p className="text-xs text-slate-500">{hint}</p>
      <input
        type="hidden"
        name="category"
        value={selected.length ? selected.join(", ") : fallbackLabel}
      />
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        {groups.map((group) => (
          <div
            key={group.title}
            className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3"
          >
            <p className="text-sm font-bold text-slate-800">
              {group.icon ? `${group.icon} ` : ""}
              {group.title}
            </p>
            <div className="mt-2 space-y-1">
              {group.items.map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-2 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(item)}
                    onChange={() => toggle(item)}
                    className="h-4 w-4"
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
