"use client";

import { useFormState } from "react-dom";
import { createVenueAction } from "@/app/actions/venues";
import { emptyState } from "@/lib/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { Field, inputClass } from "@/components/ui";
import { FormError } from "@/components/forms/FormError";

export function VenueForm({
  defaultName,
  defaultCity,
  defaultCountry,
}: {
  defaultName?: string;
  defaultCity?: string;
  defaultCountry?: string;
}) {
  const [state, formAction] = useFormState(createVenueAction, emptyState);

  return (
    <form action={formAction} className="space-y-3">
      <FormError>{state.error}</FormError>

      <Field label="Venue name" required>
        <input
          name="name"
          required
          minLength={3}
          maxLength={120}
          defaultValue={defaultName}
          placeholder="e.g. Royal Albert Palace"
          className={inputClass}
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="City" required>
          <input
            name="city"
            required
            minLength={2}
            maxLength={80}
            defaultValue={defaultCity}
            placeholder="Fords"
            className={inputClass}
          />
        </Field>
        <Field label="State">
          <input
            name="state"
            maxLength={60}
            placeholder="NJ"
            className={inputClass}
          />
        </Field>
        <Field label="Country">
          <input
            name="country"
            maxLength={60}
            defaultValue={defaultCountry}
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="Street address">
        <input
          name="address"
          maxLength={300}
          placeholder="1050 King Georges Post Rd"
          className={inputClass}
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Venue website">
          <input
            name="website"
            type="url"
            placeholder="https://"
            className={inputClass}
          />
        </Field>
        <Field label="Google Maps link">
          <input
            name="mapsUrl"
            type="url"
            placeholder="https://maps.app.goo.gl/…"
            className={inputClass}
          />
        </Field>
      </div>

      <SubmitButton pendingLabel="Saving...">Create venue page</SubmitButton>
    </form>
  );
}
