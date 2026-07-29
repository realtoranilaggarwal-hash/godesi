"use client";

import { useFormState } from "react-dom";
import {
  claimPressCardAction,
  saveJournalistPhoneAction,
} from "@/app/actions/journalist";
import { emptyState } from "@/lib/actions";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/forms/FormError";

export function JournalistPhoneForm({ phone }: { phone: string | null }) {
  const [state, formAction] = useFormState(
    saveJournalistPhoneAction,
    emptyState,
  );

  return (
    <form action={formAction} className="space-y-2">
      <FormError>{state.error}</FormError>
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}
      <Field
        label="Mobile number"
        hint="Country code included, e.g. +91 98765 43210 — never shown publicly"
      >
        <input
          name="phone"
          type="tel"
          defaultValue={phone ?? ""}
          className={inputClass}
        />
      </Field>
      <SubmitButton pendingLabel="Saving…">Save number</SubmitButton>
    </form>
  );
}

export function ClaimPressCardForm({ missing }: { missing: string[] }) {
  const [state, formAction] = useFormState(claimPressCardAction, emptyState);

  return (
    <form action={formAction} className="space-y-2">
      <FormError>{state.error}</FormError>
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}
      {missing.length ? (
        <ul className="space-y-1 text-sm text-slate-600">
          {missing.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden>☐</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <SubmitButton pendingLabel="Issuing…">
        {missing.length ? "Check again" : "Issue my press card"}
      </SubmitButton>
    </form>
  );
}
