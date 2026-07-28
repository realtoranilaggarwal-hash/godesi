"use client";

import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { saveBannerAction } from "@/app/actions/admin";
import { emptyState } from "@/lib/actions";
import { AD_PLACEMENTS, AD_SLOT_ORDER } from "@/lib/ads";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/forms/FormError";

export function BannerForm() {
  const [state, formAction] = useFormState(saveBannerAction, emptyState);
  const form = useRef<HTMLFormElement>(null);

  // A saved banner is done with: clearing the fields stops the next save from
  // silently re-posting the previous creative.
  useEffect(() => {
    if (state.success) form.current?.reset();
  }, [state.success]);

  return (
    <form ref={form} action={formAction} className="space-y-3">
      <FormError>{state.error}</FormError>
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Slot">
          <select name="slot" defaultValue="SIDEBAR" className={inputClass}>
            {AD_SLOT_ORDER.map((slot) => {
              const placement = AD_PLACEMENTS[slot];
              return (
                <option key={slot} value={slot}>
                  {placement.name} — {placement.size.width}×
                  {placement.size.height} ({placement.slots} slot
                  {placement.slots > 1 ? "s" : ""})
                </option>
              );
            })}
          </select>
        </Field>
        <Field label="Position" hint="Sidebar 1–10 · skyscraper 1–4 · header 1">
          <input
            name="position"
            type="number"
            min={1}
            max={AD_PLACEMENTS.SIDEBAR.slots}
            defaultValue={1}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Advertiser / title">
          <input name="title" required className={inputClass} />
        </Field>
        <Field label="Image URL">
          <input name="imageUrl" type="url" required className={inputClass} />
        </Field>
        <Field label="Destination URL">
          <input name="linkUrl" type="url" required className={inputClass} />
        </Field>
        <Field
          label="Views cap"
          hint="Optional — retires the banner once delivered"
        >
          <input
            name="impressionCap"
            type="number"
            min={1}
            className={inputClass}
          />
        </Field>
        <Field label="Runs until" hint="Optional end date">
          <input name="endsAt" type="date" className={inputClass} />
        </Field>
      </div>

      <p className="text-xs text-slate-500">
        Saved banners go live immediately — no payment step. Leave the views cap
        and end date blank to run indefinitely.
      </p>

      <SubmitButton>Save banner</SubmitButton>
    </form>
  );
}
