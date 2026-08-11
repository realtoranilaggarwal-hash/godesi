"use client";

import { useFormState } from "react-dom";
import {
  claimPressCardAction,
  saveJournalistPhoneAction,
} from "@/app/actions/journalist";
import { emptyState } from "@/lib/actions";
import { Field } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/forms/FormError";
import { PhoneInput } from "@/components/forms/PhoneInput";
import { DIAL_CODE_HINT } from "@/lib/dialCodes";
import { FormSuccess } from "@/components/forms/FormSuccess";

export function JournalistPhoneForm({ phone }: { phone: string | null }) {
  const [state, formAction] = useFormState(
    saveJournalistPhoneAction,
    emptyState,
  );

  return (
    <form action={formAction} className="space-y-2">
      <FormError>{state.error}</FormError>
      <FormSuccess>{state.success}</FormSuccess>
      <Field
        label="Mobile number"
        hint={`Never shown publicly. ${DIAL_CODE_HINT}`}
      >
        <PhoneInput name="phone" defaultValue={phone ?? ""} />
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
      <FormSuccess>{state.success}</FormSuccess>
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
