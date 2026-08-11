"use client";

import Link from "next/link";
import { useState } from "react";
import { Field, inputClass } from "@/components/ui";
import { customOptionsOf, disclaimerFor, specialtySet } from "@/lib/specialties";
import { OptionSearchPicker } from "@/components/forms/OptionSearchPicker";
import { ImageField } from "@/components/forms/ImageField";
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
  serviceOptions: string[];
  priceFrom: string;
  priceHourly: string;
  priceExtra: string;
  availability: string;
  licenseDocUrl: string;
};

/**
 * The dynamic professional block: specialisations, certifications and the
 * profession's detail fields, all driven by the subcategory's SpecialtySet.
 */
export function SpecialtyPicker({
  subcategorySlug,
  defaults,
  canFeature,
  cardSaved,
}: {
  subcategorySlug: string;
  defaults: SpecialtyDefaults;
  canFeature: boolean;
  /** Agent extras live on their own page, which needs a saved card to attach to. */
  cardSaved: boolean;
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

      {set.optionTabs ? (
        <div className="mt-3">
          <OptionSearchPicker
            name="specialties"
            tabs={set.optionTabs}
            bundles={set.bundles}
            defaultSelected={defaults.specialties.filter((option) =>
              set.options.includes(option),
            )}
            onSelectionChange={(next) => {
              setSelected(next);
              if (featured && !next.includes(featured)) setFeatured("");
            }}
          />
        </div>
      ) : (
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
      )}

      {set.customOption ? (
        <div className="mt-3">
          <Field label={set.customOption.label} hint={set.customOption.hint}>
            <input
              name="specialtiesOther"
              defaultValue={customOptionsOf(
                subcategorySlug,
                defaults.specialties,
              ).join(", ")}
              className={inputClass}
            />
          </Field>
        </div>
      ) : null}

      {selected.length === 0 ? (
        <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
          Pick at least one before saving.
        </p>
      ) : null}

      {set.choices?.map((group) => (
        <div key={group.key} className="mt-4">
          <p className="text-sm font-bold text-cyan-900">
            {group.title}
            {group.required ? <span className="text-rose-600"> *</span> : null}
          </p>
          {group.hint ? (
            <p className="text-xs text-cyan-900/80">{group.hint}</p>
          ) : null}
          <div className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
            {group.options.map((option) => (
              <label
                key={option}
                className="flex items-start gap-2 text-sm text-slate-700"
              >
                <input
                  type={group.mode === "single" ? "radio" : "checkbox"}
                  name={group.mode === "single" ? `choice-${group.key}` : "serviceOptions"}
                  value={option}
                  defaultChecked={defaults.serviceOptions.includes(option)}
                  className="mt-0.5 h-4 w-4"
                />
                {option}
              </label>
            ))}
          </div>
        </div>
      ))}

      {set.pricing ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {set.pricing.map((price) => (
            <Field key={price.key} label={price.label} hint={price.hint}>
              <input
                name={price.key}
                defaultValue={defaults[price.key]}
                className={inputClass}
              />
            </Field>
          ))}
        </div>
      ) : null}

      {set.availability ? (
        <div className="mt-3">
          <Field label={set.availability.label} hint={set.availability.hint}>
            <input
              name="availability"
              defaultValue={defaults.availability}
              className={inputClass}
            />
          </Field>
        </div>
      ) : null}

      {set.licenseDoc ? (
        <div className="mt-3">
          <ImageField
            name="licenseDocUrl"
            purpose="gallery"
            label={set.licenseDoc.label}
            hint={set.licenseDoc.hint}
            defaultValue={defaults.licenseDocUrl}
          />
        </div>
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
              : "Available on Pro and Premium — highlight one service on your card."
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
        {canFeature ? null : (
          <Link
            href="/pricing?reason=featured"
            className="mt-2 inline-block rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-3 py-1.5 text-xs font-bold text-white hover:opacity-90"
          >
            ⭐ Upgrade to Pro or Premium →
          </Link>
        )}
      </div>

      {isAgentCard(subcategorySlug) ? (
        cardSaved ? (
          <p className="mt-3 text-xs font-semibold text-cyan-900">
            <Link href="/dashboard/agent" className="underline">
              Add brokerage, MLS, languages and closed sales →
            </Link>
          </p>
        ) : (
          <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
            Save this business card first. Brokerage, MLS, languages and closed
            sales open on the agent page straight after you save.
          </p>
        )
      ) : null}

      <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs text-slate-600">
        {disclaimerFor(subcategorySlug)}
      </p>
    </details>
  );
}
