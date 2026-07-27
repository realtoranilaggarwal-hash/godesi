"use client";

import { useState } from "react";
import { inputClass } from "@/components/ui";
import { specialtySet } from "@/lib/specialties";

/**
 * Checkbox grid of sub-services for subcategories that have one (attorneys
 * today). Paid plans can highlight one of the picked services as a badge.
 */
export function SpecialtyPicker({
  subcategorySlug,
  defaultValues,
  defaultFeatured,
  canFeature,
}: {
  subcategorySlug: string;
  defaultValues: string[];
  defaultFeatured: string | null;
  canFeature: boolean;
}) {
  const set = specialtySet(subcategorySlug);
  const [selected, setSelected] = useState<string[]>(defaultValues);
  const [featured, setFeatured] = useState(defaultFeatured ?? "");

  if (!set) return null;

  const toggle = (option: string) =>
    setSelected((current) => {
      const next = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option];
      if (featured && !next.includes(featured)) setFeatured("");
      return next;
    });

  return (
    <fieldset className="rounded-2xl border border-cyan-200 bg-cyan-50/60 p-4">
      <legend className="px-1 text-sm font-bold text-cyan-900">{set.title}</legend>
      <p className="text-xs text-cyan-900/80">{set.hint}</p>

      <div className="mt-3 grid gap-x-4 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
        {set.options.map((option) => (
          <label
            key={option}
            className="flex items-start gap-2 text-sm text-slate-700"
          >
            <input
              type="checkbox"
              name="specialties"
              value={option}
              checked={selected.includes(option)}
              onChange={() => toggle(option)}
              className="mt-0.5 h-4 w-4"
            />
            {option}
          </label>
        ))}
      </div>

      {selected.length === 0 ? (
        <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
          Pick at least one service before saving.
        </p>
      ) : null}

      <div className="mt-3">
        <label className="text-sm font-semibold text-cyan-900">
          Featured specialisation
        </label>
        <p className="text-xs text-cyan-900/80">
          {canFeature
            ? "Shown as a highlighted badge on your card and in search."
            : "Available on paid plans — upgrade to highlight one service."}
        </p>
        <select
          name="featuredSpecialty"
          value={featured}
          disabled={!canFeature || selected.length === 0}
          onChange={(event) => setFeatured(event.target.value)}
          className={`${inputClass} mt-1`}
        >
          <option value="">No badge</option>
          {selected.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </fieldset>
  );
}
