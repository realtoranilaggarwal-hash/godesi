"use client";

import { useFormState } from "react-dom";
import { addMediaAction } from "@/app/actions/business";
import { emptyState } from "@/lib/actions";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";

export function AddMediaForm() {
  const [state, formAction] = useFormState(addMediaAction, emptyState);

  return (
    <form action={formAction} className="space-y-3">
      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Media URL">
          <input name="url" required placeholder="https://..." className={inputClass} />
        </Field>
        <Field label="Type">
          <select name="type" defaultValue="IMAGE" className={inputClass}>
            <option value="IMAGE">Image</option>
            <option value="VIDEO">Video</option>
          </select>
        </Field>
        <Field label="Caption">
          <input name="caption" className={inputClass} />
        </Field>
      </div>

      <SubmitButton pendingLabel="Adding...">Add to gallery</SubmitButton>
    </form>
  );
}
