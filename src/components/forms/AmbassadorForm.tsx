"use client";

import { useFormState } from "react-dom";
import { applyAmbassadorAction } from "@/app/actions/joinGoals";
import { emptyState } from "@/lib/actions";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/forms/FormError";
import { PhoneInput } from "@/components/forms/PhoneInput";
import { AMBASSADOR_HELP, AMBASSADOR_PLEDGE } from "@/lib/joinGoals";

export function AmbassadorForm({
  name,
  defaults,
}: {
  name: string;
  defaults: {
    city: string;
    phone: string;
    pitch: string;
    helps: string[];
  };
}) {
  const [state, formAction] = useFormState(applyAmbassadorAction, emptyState);

  if (state.success) return <Alert tone="success">{state.success}</Alert>;

  return (
    <form action={formAction} className="space-y-4">
      <FormError>{state.error}</FormError>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="City or area you will cover" required>
          <input
            name="city"
            defaultValue={defaults.city}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Phone / WhatsApp" hint="Only the GoDesi team sees it.">
          <PhoneInput name="phone" defaultValue={defaults.phone} />
        </Field>
      </div>
      <Field
        label="Why do you want to be a GoDesi ambassador?"
        hint="Your community work, groups you are part of, what you can do."
        required
      >
        <textarea
          name="pitch"
          rows={4}
          defaultValue={defaults.pitch}
          required
          className={inputClass}
        />
      </Field>
      <fieldset>
        <legend className="mb-1.5 text-sm font-semibold text-slate-800">
          How would you like to help?
        </legend>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {AMBASSADOR_HELP.map((item) => (
            <label key={item.id} className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                name="helps"
                value={item.id}
                defaultChecked={defaults.helps.includes(item.id)}
                className="mt-0.5 h-4 w-4 shrink-0"
              />
              {item.label}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <legend className="px-1 text-sm font-bold text-amber-900">
          📜 GoDesi ambassador ethics pledge — tick every line
        </legend>
        <div className="space-y-2">
          {AMBASSADOR_PLEDGE.map((line, index) => (
            <label
              key={line}
              className="flex items-start gap-2 text-sm text-amber-950"
            >
              <input
                type="checkbox"
                name="pledge"
                value={index}
                required
                className="mt-0.5 h-4 w-4 shrink-0"
              />
              {line}
            </label>
          ))}
        </div>
        <div className="mt-4">
          <Field
            label="Sign by typing your full name"
            hint={`Type it as it is on your account: ${name}`}
            required
          >
            <input
              name="signedName"
              required
              autoComplete="off"
              className={`${inputClass} font-serif italic`}
            />
          </Field>
        </div>
      </fieldset>
      <SubmitButton pendingLabel="Signing...">
        Sign the pledge and apply
      </SubmitButton>
    </form>
  );
}
