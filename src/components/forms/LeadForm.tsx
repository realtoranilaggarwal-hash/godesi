"use client";

import { useFormState } from "react-dom";
import { createLeadAction } from "@/app/actions/leads";
import { emptyState } from "@/lib/actions";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";

export function LeadForm({
  defaultName,
  defaultEmail,
}: {
  defaultName?: string;
  defaultEmail?: string;
}) {
  const [state, formAction] = useFormState(createLeadAction, emptyState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? <Alert>{state.error}</Alert> : null}

      <Field label="Title" hint="e.g. Need 500 wedding invitation cards printed">
        <input name="title" required className={inputClass} />
      </Field>
      <Field label="Description">
        <textarea name="description" rows={4} required className={inputClass} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category">
          <input name="category" required className={inputClass} />
        </Field>
        <Field label="City">
          <input name="city" required className={inputClass} />
        </Field>
        <Field label="Budget from (₹)">
          <input name="budgetMin" type="number" min={0} className={inputClass} />
        </Field>
        <Field label="Budget to (₹)">
          <input name="budgetMax" type="number" min={0} className={inputClass} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Contact name">
          <input
            name="contactName"
            required
            defaultValue={defaultName ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Contact phone">
          <input name="contactPhone" required className={inputClass} />
        </Field>
        <Field label="Contact email">
          <input
            name="contactEmail"
            type="email"
            defaultValue={defaultEmail ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      <SubmitButton pendingLabel="Posting...">Post requirement</SubmitButton>
    </form>
  );
}
