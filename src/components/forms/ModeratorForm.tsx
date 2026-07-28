"use client";

import { useFormState } from "react-dom";
import { grantModeratorAction } from "@/app/actions/team";
import { emptyState } from "@/lib/actions";
import { STAFF_PERMISSIONS } from "@/lib/permissions";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/forms/FormError";

export function ModeratorForm() {
  const [state, formAction] = useFormState(grantModeratorAction, emptyState);

  return (
    <form action={formAction} className="space-y-3">
      <FormError>{state.error}</FormError>
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      <Field label="Member email" hint="They must have a Godesi account already">
        <input name="email" type="email" required className={inputClass} />
      </Field>

      <fieldset>
        <legend className="text-sm font-bold">What can they do?</legend>
        <p className="text-xs text-slate-500">
          Payments, plans, members, coupons and reward points always stay
          admin-only.
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {STAFF_PERMISSIONS.map((permission) => (
            <label
              key={permission.key}
              className="flex gap-2 rounded-xl border border-slate-200 p-2 text-sm"
            >
              <input
                type="checkbox"
                name="permissions"
                value={permission.key}
                className="mt-0.5"
              />
              <span>
                <span className="font-semibold">{permission.label}</span>
                <span className="block text-xs text-slate-500">{permission.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <SubmitButton>Save access</SubmitButton>
    </form>
  );
}
