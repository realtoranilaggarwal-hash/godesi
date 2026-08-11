"use client";

import { useState } from "react";
import { EMPTY_ENTRY, MIN_YEAR, type AlumniEntry } from "@/lib/alumni";
import { Field, inputClass } from "@/components/ui";

/**
 * School and college rows. Each row is stored separately so batchmates can be
 * matched on institution plus passing year, not just free text.
 */
export function AlumniFields({ defaults }: { defaults: AlumniEntry[] }) {
  const [rows, setRows] = useState<AlumniEntry[]>(
    defaults.length ? defaults : [EMPTY_ENTRY],
  );
  const thisYear = new Date().getFullYear();

  return (
    <fieldset className="rounded-2xl border border-slate-200 p-4">
      <legend className="px-1 text-sm font-bold text-slate-900">
        School &amp; college
      </legend>
      <p className="text-xs text-slate-500">
        Add each school, college or course with the year you passed — batchmates
        can then find you on the{" "}
        <a href="/alumni" className="font-semibold underline">
          alumni finder
        </a>
        .
      </p>

      <div className="mt-3 space-y-4">
        {rows.map((row, index) => (
          <div
            key={index}
            className="grid gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-2"
          >
            <Field label="School / college / university">
              <input
                name="alumniInstitution"
                defaultValue={row.institution}
                placeholder="e.g. NIT Trichy"
                maxLength={120}
                className={inputClass}
              />
            </Field>
            <Field label="Degree or class" hint="Optional — e.g. B.Tech, MBA, Class of 12th">
              <input
                name="alumniDegree"
                defaultValue={row.degree}
                maxLength={80}
                className={inputClass}
              />
            </Field>
            <Field label="Course / stream" hint="Optional — e.g. Computer Science">
              <input
                name="alumniField"
                defaultValue={row.fieldOfStudy}
                maxLength={80}
                className={inputClass}
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="City" hint="Optional">
                <input
                  name="alumniCity"
                  defaultValue={row.city}
                  maxLength={80}
                  className={inputClass}
                />
              </Field>
              <Field label="Year passed" hint="Leave blank if studying">
                <input
                  name="alumniYear"
                  type="number"
                  min={MIN_YEAR}
                  max={thisYear + 8}
                  defaultValue={row.endYear}
                  placeholder={String(thisYear)}
                  className={inputClass}
                />
              </Field>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setRows((current) => [...current, EMPTY_ENTRY])}
          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
        >
          + Add another
        </button>
        {rows.length > 1 ? (
          <button
            type="button"
            onClick={() => setRows((current) => current.slice(0, -1))}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200"
          >
            Remove last
          </button>
        ) : null}
      </div>
    </fieldset>
  );
}
