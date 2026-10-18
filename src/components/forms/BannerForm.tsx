"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { saveBannerAction } from "@/app/actions/admin";
import { emptyState } from "@/lib/actions";
import { AD_PLACEMENTS, AD_SLOT_ORDER } from "@/lib/ads";
import type { BannerSlot } from "@prisma/client";
import { Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { DesignHelp } from "@/components/DesignHelp";
import { ImageField } from "@/components/forms/ImageField";
import { FormError } from "@/components/forms/FormError";
import { FormSuccess } from "@/components/forms/FormSuccess";

export function BannerForm({ slot }: { slot?: string }) {
  const retired = AD_SLOT_ORDER.find((option) => option === slot)
    ? null
    : (Object.keys(AD_PLACEMENTS) as (keyof typeof AD_PLACEMENTS)[]).find(
        (option) => option === slot,
      );
  const [state, formAction] = useFormState(saveBannerAction, emptyState);
  const form = useRef<HTMLFormElement>(null);
  const [chosen, setChosen] = useState<BannerSlot>(
    retired ?? AD_SLOT_ORDER.find((option) => option === slot) ?? "SIDEBAR",
  );
  const [saved, setSaved] = useState(0);
  const size = AD_PLACEMENTS[chosen].size;

  // A saved banner is done with: clearing the fields stops the next save from
  // silently re-posting the previous creative.
  useEffect(() => {
    if (state.success) {
      form.current?.reset();
      setSaved((count) => count + 1);
    }
  }, [state]);

  return (
    <form ref={form} action={formAction} className="space-y-3">
      <FormError>{state.error}</FormError>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Slot">
          <select
            name="slot"
            value={chosen}
            onChange={(event) => setChosen(event.target.value as BannerSlot)}
            className={inputClass}
          >
            {(retired ? [retired, ...AD_SLOT_ORDER] : AD_SLOT_ORDER).map(
              (option) => {
                const placement = AD_PLACEMENTS[option];
                return (
                  <option key={option} value={option}>
                    {placement.name} — {placement.size.width}×
                    {placement.size.height}{" "}
                    {option === retired
                      ? "(not shown on the site)"
                      : `(${placement.slots} shown at a time)`}
                  </option>
                );
              },
            )}
          </select>
        </Field>
        <Field
          label="Position"
          hint="Leave blank for the next free number — a placement never fills up"
        >
          <input
            name="position"
            type="number"
            min={1}
            placeholder="next free number"
            className={inputClass}
          />
        </Field>
        <Field label="Advertiser / title">
          <input name="title" required className={inputClass} />
        </Field>
        <ImageField
          key={saved}
          name="imageUrl"
          label="Banner image"
          purpose="banner"
          hint={`Upload it at exactly ${size.width} × ${size.height} px`}
          previewClassName="h-24 w-40 rounded-xl object-contain bg-slate-50"
        />
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
        <Field
          label="Advertiser email"
          hint="Optional — links the banner to their account: they see its views and can upload a new image in Dashboard → My ads"
        >
          <input name="advertiserEmail" type="email" className={inputClass} />
        </Field>
        <Field label="Runs until" hint="Optional end date">
          <input name="endsAt" type="date" className={inputClass} />
        </Field>
      </div>

      <p className="text-xs text-slate-500">
        Saved banners go live immediately — no payment step. Leave the views cap
        and end date blank to run indefinitely. Banners sharing a slot type
        rotate: the one shown least so far is served first, so every advertiser
        gets a fair share of views.
      </p>

      <details>
        <summary className="cursor-pointer text-sm font-semibold text-indigo-600">
          Need the banner designed? Prompt for {size.width} × {size.height}
        </summary>
        <div className="mt-2">
          <DesignHelp size={size} />
        </div>
      </details>

      <FormSuccess>{state.success}</FormSuccess>
      <SubmitButton>Save banner</SubmitButton>
    </form>
  );
}
