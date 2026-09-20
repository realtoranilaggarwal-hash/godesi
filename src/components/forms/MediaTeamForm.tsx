"use client";

import { useFormState } from "react-dom";
import { applyToMediaTeamAction } from "@/app/actions/media";
import { emptyState } from "@/lib/actions";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/forms/FormError";
import { PhoneInput } from "@/components/forms/PhoneInput";
import { MEDIA_ROLES } from "@/lib/media";

export function MediaTeamForm({
  defaultName = "",
  defaultEmail = "",
  defaultCity = "",
}: {
  defaultName?: string;
  defaultEmail?: string;
  defaultCity?: string;
}) {
  const [state, formAction] = useFormState(applyToMediaTeamAction, emptyState);

  if (state.success) return <Alert tone="success">{state.success}</Alert>;

  return (
    <form action={formAction} className="space-y-4">
      <FormError>{state.error}</FormError>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" required>
          <input
            name="name"
            defaultValue={defaultName}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Email" required>
          <input
            name="email"
            type="email"
            defaultValue={defaultEmail}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Phone / WhatsApp">
          <PhoneInput name="phone" />
        </Field>
        <Field
          label="City"
          required
          hint="We start in Central New Jersey and grow city by city."
        >
          <input
            name="city"
            defaultValue={defaultCity}
            required
            className={inputClass}
          />
        </Field>
      </div>

      <fieldset>
        <legend className="mb-1 block text-sm font-medium text-slate-700">
          What would you like to do? <span className="text-rose-600">*</span>
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {MEDIA_ROLES.map((role) => (
            <label
              key={role.id}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <input type="checkbox" name="roles" value={role.id} />
              {role.label}
            </label>
          ))}
        </div>
      </fieldset>

      <Field
        label="Languages you can interview or write in"
        hint="English, Hindi, Gujarati, Punjabi, Telugu, Tamil, Bengali, Urdu…"
      >
        <input name="languages" className={inputClass} />
      </Field>

      <Field
        label="What have you done so far?"
        required
        hint="Shows, videos, articles, a radio slot, a college club — or simply why you would be good at it."
      >
        <textarea
          name="experience"
          rows={5}
          required
          minLength={40}
          className={inputClass}
        />
      </Field>

      <Field
        label="Links to your work"
        hint="YouTube, Instagram, LinkedIn, articles — one per line."
      >
        <textarea name="links" rows={2} className={inputClass} />
      </Field>

      <Field
        label="Availability"
        hint="Weekday evenings? Saturdays at the Iselin studio? Hours a week?"
      >
        <input name="availability" className={inputClass} />
      </Field>

      <SubmitButton pendingLabel="Sending…">Send my application</SubmitButton>
    </form>
  );
}
