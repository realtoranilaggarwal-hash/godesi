"use client";

import { useState } from "react";
import type { SpecialtySet } from "@/lib/specialties";
import { OptionSearchPicker } from "@/components/forms/OptionSearchPicker";

export type RequirementOptionSet = {
  slug: string;
  name: string;
  set: SpecialtySet;
};

const boxClass = "rounded-2xl border border-slate-200 bg-slate-50/60 p-3";

/**
 * Mirrors the posting form on the requirement side: choosing a service type
 * reveals exactly the options providers filled in, so a client asks for what
 * businesses can actually be filtered by.
 */
export function RequirementOptions({
  sets,
  defaultSlug,
}: {
  sets: RequirementOptionSet[];
  defaultSlug?: string;
}) {
  const [slug, setSlug] = useState(
    defaultSlug && sets.some((entry) => entry.slug === defaultSlug)
      ? defaultSlug
      : (sets[0]?.slug ?? ""),
  );

  const active = sets.find((entry) => entry.slug === slug);
  if (!active) return null;

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-slate-800">
        What exactly do you need?
      </legend>
      <p className="text-xs text-slate-500">
        The same options providers fill in, so only matching businesses reply.
      </p>

      <input type="hidden" name="categorySlug" value={slug} />

      {sets.length > 1 ? (
        <label className="block text-sm font-semibold text-slate-700">
          Service type
          <select
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
          >
            {sets.map((entry) => (
              <option key={entry.slug} value={entry.slug}>
                {entry.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <div key={slug} className="grid gap-3 sm:grid-cols-2">
        <div className={`${boxClass} sm:col-span-2`}>
          <p className="text-sm font-bold text-slate-800">{active.set.title}</p>
          {active.set.optionTabs ? (
            <div className="mt-2">
              <OptionSearchPicker
                name="serviceOptions"
                tabs={active.set.optionTabs}
                bundles={active.set.bundles}
              />
            </div>
          ) : (
          <div className="mt-2 space-y-1">
            {active.set.options.map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  name="serviceOptions"
                  value={option}
                  className="h-4 w-4"
                />
                {option}
              </label>
            ))}
          </div>
          )}
        </div>

        {(active.set.choices ?? []).map((group) => (
          <div key={group.key} className={boxClass}>
            <p className="text-sm font-bold text-slate-800">
              {group.title}
              {group.required ? " *" : ""}
            </p>
            {group.hint ? (
              <p className="text-xs text-slate-500">{group.hint}</p>
            ) : null}
            <div className="mt-2 space-y-1">
              {group.options.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-2 text-sm text-slate-700"
                >
                  <input
                    type={group.mode === "single" ? "radio" : "checkbox"}
                    name={
                      group.mode === "single"
                        ? `choice-${group.key}`
                        : "serviceOptions"
                    }
                    value={option}
                    required={group.mode === "single" && group.required}
                    className="h-4 w-4"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
