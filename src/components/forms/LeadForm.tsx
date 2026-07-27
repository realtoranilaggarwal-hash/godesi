"use client";

import { useFormState } from "react-dom";
import { createLeadAction } from "@/app/actions/leads";
import { emptyState } from "@/lib/actions";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { ServicePicker, type ServiceGroup } from "@/components/forms/ServicePicker";

export function LeadForm({
  defaultName,
  defaultEmail,
  defaultCategory,
  groups,
}: {
  defaultName?: string;
  defaultEmail?: string;
  defaultCategory?: string;
  /** Tick-box services; falls back to a plain text field when omitted. */
  groups?: ServiceGroup[];
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

      {groups?.length ? (
        <ServicePicker
          groups={groups}
          fallbackLabel={defaultCategory ?? "General requirement"}
          legend="What do you need?"
          hint="Tick everything you need — matching businesses will see your post."
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {groups?.length ? null : (
          <Field label="Category">
            <input
              name="category"
              required
              defaultValue={defaultCategory ?? ""}
              className={inputClass}
            />
          </Field>
        )}
        <Field label="City">
          <input name="city" required className={inputClass} />
        </Field>
        <Field label="Budget from (₹)">
          <input name="budgetMin" type="number" min={0} className={inputClass} />
        </Field>
        <Field label="Budget to (₹)">
          <input name="budgetMax" type="number" min={0} className={inputClass} />
        </Field>
        <Field label="Event date" hint="Optional — helps vendors check availability">
          <input name="eventDate" type="date" className={inputClass} />
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
