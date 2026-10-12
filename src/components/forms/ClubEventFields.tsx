"use client";

import { useState } from "react";
import Link from "next/link";
import { Field, inputClass } from "@/components/ui";
import {
  BRING_OPTIONS,
  CONTRIBUTION_MODES,
  PARTICIPATE_OPTIONS,
} from "@/lib/clubs";

export type ClubOption = { id: string; slug: string; name: string };

/**
 * The club block on the event form: which club the event belongs to, how
 * members chip in beyond tickets, and what they can offer to bring or do.
 */
export function ClubEventFields({
  clubs,
  defaultClub,
  currency,
}: {
  clubs: ClubOption[];
  defaultClub?: string;
  currency: string;
}) {
  const [contribution, setContribution] = useState<string>("NONE");
  const preset = clubs.find((c) => c.slug === defaultClub);

  return (
    <fieldset className="space-y-3 rounded-2xl border border-slate-200 p-4">
      <legend className="px-1 text-sm font-bold text-slate-900">
        Club meet? Members RSVP with what they bring and do
      </legend>

      {clubs.length ? (
        <Field
          label="This event belongs to"
          hint="Members of the club see it on the club page and get asked to RSVP."
        >
          <select
            name="clubId"
            defaultValue={preset?.id ?? ""}
            className={inputClass}
          >
            <option value="">No club — a one-off public event</option>
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      ) : (
        <p className="text-xs text-slate-500">
          Run a karaoke circle, cricket team or foodie group?{" "}
          <Link href="/clubs/new" className="font-semibold text-indigo-600">
            Start a club
          </Link>{" "}
          and its events get member RSVPs, bring-lists and contributions.
        </p>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">Contribution</p>
        {CONTRIBUTION_MODES.map((m) => (
          <label key={m.value} className="flex items-start gap-2 text-sm">
            <input
              type="radio"
              name="contributionMode"
              value={m.value}
              checked={contribution === m.value}
              onChange={() => setContribution(m.value)}
              className="mt-1"
            />
            <span>
              <span className="font-semibold">{m.label}</span>
              <span className="block text-xs text-slate-500">{m.hint}</span>
            </span>
          </label>
        ))}
        {contribution === "SUGGESTED" ? (
          <Field label={`Suggested amount per person (${currency})`}>
            <input
              name="contributionAmount"
              type="number"
              min={0}
              step="0.01"
              placeholder="10"
              className={inputClass}
            />
          </Field>
        ) : null}
        {contribution !== "NONE" ? (
          <Field
            label="Contribution note"
            hint="e.g. “Covers the hall and snacks — cash or Zelle at the door”."
          >
            <input
              name="contributionNote"
              maxLength={200}
              className={inputClass}
            />
          </Field>
        ) : null}
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700">
          Members can offer to bring
        </p>
        <div className="mt-1 flex flex-wrap gap-2">
          {BRING_OPTIONS.map((option) => (
            <label
              key={option}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1 text-xs"
            >
              <input type="checkbox" name="bringOptions" value={option} />
              {option}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700">
          Members can take part in
        </p>
        <div className="mt-1 flex flex-wrap gap-2">
          {PARTICIPATE_OPTIONS.map((option) => (
            <label
              key={option}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1 text-xs"
            >
              <input type="checkbox" name="participateOptions" value={option} />
              {option}
            </label>
          ))}
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Tick “Singing” for a karaoke night — each singer says what
          they&rsquo;ll sing when they RSVP and the organiser gets the line-up.
        </p>
      </div>
    </fieldset>
  );
}
