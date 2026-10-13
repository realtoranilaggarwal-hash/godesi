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
import { FormError } from "@/components/forms/FormError";
import { PhoneInput } from "@/components/forms/PhoneInput";
import { DIAL_CODE_HINT } from "@/lib/dialCodes";
import { LocationScopeField } from "@/components/forms/LocationScopeField";
import { BudgetFields } from "@/components/forms/BudgetFields";

export function LeadForm({
  defaultName,
  defaultEmail,
  defaultCategory,
  groups,
  optionSets,
  defaultOptionSlug,
  currency,
}: {
  defaultName?: string;
  defaultEmail?: string;
  defaultCategory?: string;
  /** Tick-box services; falls back to a plain text field when omitted. */
  groups?: ServiceGroup[];
  /** Per-subcategory option groups, mirroring the posting form. */
  optionSets?: RequirementOptionSet[];
  defaultOptionSlug?: string;
  /** Guessed from where the visitor is; they can change it. */
  currency: string;
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
        <LocationScopeField />
        <BudgetFields currency={currency} />
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
        <Field label="Contact phone" hint={DIAL_CODE_HINT} required>
          <PhoneInput name="contactPhone" required />
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
