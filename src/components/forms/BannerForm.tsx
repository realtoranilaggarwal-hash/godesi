"use client";

import { useFormState } from "react-dom";
import { saveBannerAction } from "@/app/actions/admin";
import { emptyState } from "@/lib/actions";
import { HEADER_SIZE, SIDEBAR_SIZE, SIDEBAR_SLOTS } from "@/lib/banners";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";

export function BannerForm() {
  const [state, formAction] = useFormState(saveBannerAction, emptyState);

  return (
    <form action={formAction} className="space-y-3">
      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Slot"
          hint={`Sidebar ${SIDEBAR_SIZE.width}x${SIDEBAR_SIZE.height} · Header ${HEADER_SIZE.width}x${HEADER_SIZE.height}`}
        >
          <select name="slot" defaultValue="SIDEBAR" className={inputClass}>
            <option value="SIDEBAR">Sidebar (10 slots)</option>
            <option value="HEADER">Header (1 slot)</option>
          </select>
        </Field>
        <Field label="Position" hint={`1–${SIDEBAR_SLOTS} for sidebar, 1 for header`}>
          <input
            name="position"
            type="number"
            min={1}
            max={SIDEBAR_SLOTS}
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
      </div>

      <SubmitButton>Save banner</SubmitButton>
    </form>
  );
}
