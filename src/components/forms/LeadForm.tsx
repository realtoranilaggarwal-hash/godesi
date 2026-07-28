"use client";

import { useFormState } from "react-dom";
import { createLeadAction } from "@/app/actions/leads";
import { emptyState } from "@/lib/actions";
import { Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { WriteHelper } from "@/components/WriteHelper";
import { ServicePicker, type ServiceGroup } from "@/components/forms/ServicePicker";
import {
  RequirementOptions,
  type RequirementOptionSet,
} from "@/components/forms/RequirementOptions";
import { PHONE_PATTERN, PHONE_PATTERN_HINT } from "@/lib/format";
import { FormError } from "@/components/forms/FormError";

export function LeadForm({
  defaultName,
  defaultEmail,
  defaultCategory,
  groups,
  optionSets,
  defaultOptionSlug,
}: {
  defaultName?: string;
  defaultEmail?: string;
  defaultCategory?: string;
  /** Tick-box services; falls back to a plain text field when omitted. */
  groups?: ServiceGroup[];
  /** Per-subcategory option groups, mirroring the posting form. */
  optionSets?: RequirementOptionSet[];
  defaultOptionSlug?: string;
}) {
  const [state, formAction] = useFormState(createLeadAction, emptyState);

  return (
    <form action={formAction} className="space-y-4">
      <FormError>{state.error}</FormError>

      <Field label="Title" hint="e.g. Need 500 wedding invitation cards printed">
        <input name="title" required className={inputClass} />
      </Field>
      <Field label="Description">
        <WriteHelper
          kind="requirement"
          target="description"
          photoTarget={false}
          fields={{ title: "What I need", city: "City", budget: "Budget" }}
        />
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

      {optionSets?.length ? (
        <RequirementOptions
          sets={optionSets}
          defaultSlug={defaultOptionSlug}
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
        <Field label="Contact phone" required>
          <input
            name="contactPhone"
            required
            inputMode="tel"
            pattern={PHONE_PATTERN}
            title={PHONE_PATTERN_HINT}
            className={inputClass}
          />
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
