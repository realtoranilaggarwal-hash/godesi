"use client";

import { useState } from "react";
import {
  BENEFITS_FINE_PRINT,
  BENEFITS_INTRO,
  BENEFITS_POINTS,
  BENEFITS_QUESTION,
  CONTACT_CONSENT,
  OFFER_GROUPS,
  OFFER_INTERESTS,
  OFFER_PRIVACY,
} from "@/lib/offerInterests";
import { POINTS } from "@/lib/rewards";
import { Field, inputClass } from "@/components/ui";

export function OfferChips({
  selected = [],
  phone = "",
  contactOk = false,
}: {
  selected?: string[];
  phone?: string;
  contactOk?: boolean;
}) {
  const [picked, setPicked] = useState<string[]>(selected);
  const toggle = (id: string, on: boolean) =>
    setPicked((current) =>
      on ? [...current, id] : current.filter((value) => value !== id),
    );
  const matches = Array.from(
    new Map(
      OFFER_INTERESTS.filter((item) => picked.includes(item.id)).map((item) => [
        item.match.href,
        item,
      ]),
    ).values(),
  );

  return (
    <div className="space-y-3">
      <div className="space-y-1.5 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">{BENEFITS_QUESTION}</p>
        <p>{BENEFITS_INTRO}</p>
        <ul className="grid gap-x-4 gap-y-0.5 text-xs text-slate-600 sm:grid-cols-2">
          {BENEFITS_POINTS.map((point) => (
            <li key={point}>✓ {point}</li>
          ))}
        </ul>
      </div>
      {OFFER_GROUPS.map((group) => (
        <fieldset key={group.label}>
          <legend className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
            {group.label}
          </legend>
          <div className="grid gap-x-3 gap-y-1 sm:grid-cols-2">
            {group.items.map((item) => (
              <label
                key={item.id}
                className="flex cursor-pointer items-start gap-2 rounded-lg px-1.5 py-1 text-sm text-slate-700 hover:bg-white"
              >
                <input
                  type="checkbox"
                  name="offers"
                  value={item.id}
                  checked={picked.includes(item.id)}
                  onChange={(event) => toggle(item.id, event.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-indigo-600"
                />
                <span>
                  <span aria-hidden>{item.icon}</span> {item.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      {picked.length ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm">
          <p className="font-bold text-emerald-900">
            ⭐ {picked.length} {picked.length === 1 ? "topic" : "topics"} ticked
            = {picked.length * POINTS.OFFER_PICK} points to promote your
            business
          </p>
          <p className="mt-1 text-xs text-emerald-800">
            Matching on GoDesi right now:
          </p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {matches.map((item) => (
              <a
                key={item.match.href}
                href={item.match.href}
                target="_blank"
                rel="noopener"
                className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-100"
              >
                {item.icon} {item.match.label} →
              </a>
            ))}
          </div>
        </div>
      ) : null}
      <p className="rounded-xl bg-white p-2.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
        {OFFER_PRIVACY}
      </p>
      <label className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
        <input
          type="checkbox"
          name="offerContact"
          defaultChecked={contactOk}
          className="mt-0.5 h-4 w-4 shrink-0"
        />
        <span>
          {CONTACT_CONSENT}{" "}
          <span className="text-slate-500">
            Optional — ticking topics alone never lets a provider contact you.
          </span>
        </span>
      </label>
      <Field
        label="Phone or WhatsApp (optional)"
        hint="Used only if you tick the box above; never shown publicly."
      >
        <input
          name="offerPhone"
          type="tel"
          autoComplete="tel"
          defaultValue={phone}
          className={inputClass}
        />
      </Field>
      <p className="text-xs text-slate-500">{BENEFITS_FINE_PRINT}</p>
    </div>
  );
}
