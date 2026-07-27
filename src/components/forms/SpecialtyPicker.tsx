"use client";

import Link from "next/link";
import { useState } from "react";
import { Field, inputClass } from "@/components/ui";
import { CREDENTIALS_DISCLAIMER, specialtySet } from "@/lib/specialties";
import { isAgentCard } from "@/lib/agents";

export type SpecialtyDefaults = {
  specialties: string[];
  featuredSpecialty: string | null;
  certifications: string[];
  certificationsOther: string;
  licenseNumber: string;
  feeStructure: string;
  carriers: string;
  yearsExperience: string;
};

/**
 * The dynamic professional block: specialisations, certifications and the
 * profession's detail fields, all driven by the subcategory's SpecialtySet.
 */
export function SpecialtyPicker({
  subcategorySlug,
  defaults,
  canFeature,
}: {
  subcategorySlug: string;
  defaults: SpecialtyDefaults;
  canFeature: boolean;
}) {
  const set = specialtySet(subcategorySlug);
  const [selected, setSelected] = useState<string[]>(defaults.specialties);
  const [featured, setFeatured] = useState(defaults.featuredSpecialty ?? "");

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
    <details
      open
      className="rounded-2xl border border-cyan-200 bg-cyan-50/60 p-4 [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="cursor-pointer list-none text-sm font-bold text-cyan-900">
        {set.title} <span className="font-normal text-cyan-900/70">(tap to expand)</span>
      </summary>

      <p className="mt-1 text-xs text-cyan-900/80">{set.hint}</p>

      <div className="mt-3 grid gap-x-4 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
        {set.options.map((option) => (
          <label key={option} className="flex items-start gap-2 text-sm text-slate-700">
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
          Pick at least one before saving.
        </p>
      ) : null}

      {set.certifications ? (
        <div className="mt-4">
          <p className="text-sm font-bold text-cyan-900">{set.certifications.title}</p>
          <div className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
            {set.certifications.options.map((option) => (
              <label key={option} className="flex items-start gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="certifications"
                  value={option}
                  defaultChecked={defaults.certifications.includes(option)}
                  className="mt-0.5 h-4 w-4"
                />
                {option}
              </label>
            ))}
          </div>
          <div className="mt-2">
            <Field label="Other certifications" hint="Comma separated">
              <input
                name="certificationsOther"
                defaultValue={defaults.certificationsOther}
                className={inputClass}
              />
            </Field>
          </div>
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {set.license ? (
          <Field label={set.license.label} hint={set.license.hint}>
            <input
              name="licenseNumber"
              required={set.license.required}
              defaultValue={defaults.licenseNumber}
              className={inputClass}
            />
          </Field>
        ) : null}

        {set.experience ? (
          <Field label="Years of experience">
            <input
              name="yearsExperience"
              type="number"
              min={0}
              max={70}
              defaultValue={defaults.yearsExperience}
              className={inputClass}
            />
          </Field>
        ) : null}

        {set.fee ? (
          <Field label={set.fee.label} hint={set.fee.hint}>
            {set.fee.options ? (
              <select
                name="feeStructure"
                defaultValue={defaults.feeStructure}
                className={inputClass}
              >
                <option value="">Not specified</option>
                {set.fee.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                name="feeStructure"
                defaultValue={defaults.feeStructure}
                className={inputClass}
              />
            )}
          </Field>
        ) : null}

        {set.carriers ? (
          <Field label={set.carriers.label} hint={set.carriers.hint}>
            <input name="carriers" defaultValue={defaults.carriers} className={inputClass} />
          </Field>
        ) : null}
      </div>

      <div className="mt-3">
        <Field
          label="Featured specialisation"
          hint={
            canFeature
              ? "Shown as a highlighted badge on your card and in search."
              : "Available on paid plans — upgrade to highlight one service."
          }
        >
          <select
            name="featuredSpecialty"
            value={featured}
            disabled={!canFeature || selected.length === 0}
            onChange={(event) => setFeatured(event.target.value)}
            className={inputClass}
          >
            <option value="">No badge</option>
            {selected.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {isAgentCard(subcategorySlug) ? (
        <p className="mt-3 text-xs font-semibold text-cyan-900">
          <Link href="/dashboard/agent" className="underline">
            Add brokerage, MLS, languages and closed sales →
          </Link>
        </p>
      ) : null}

      <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs text-slate-600">
        {CREDENTIALS_DISCLAIMER}
      </p>
    </details>
  );
}
