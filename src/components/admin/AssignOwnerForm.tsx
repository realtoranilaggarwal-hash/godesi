"use client";

import { useFormState } from "react-dom";
import { adminAssignOwnerAction } from "@/app/actions/claims";
import { emptyState } from "@/lib/actions";
import { Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/forms/FormError";

export function AssignOwnerForm({
  businessId,
  ownerEmail,
}: {
  businessId: string;
  ownerEmail: string | null;
}) {
  const [state, formAction] = useFormState(adminAssignOwnerAction, emptyState);

  if (state.success) {
    return (
      <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
        {state.success}
      </p>
    );
  }
  if (ownerEmail) {
    return (
      <p className="text-sm text-slate-600">
        Already belongs to {ownerEmail}.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <FormError>{state.error}</FormError>
      <input type="hidden" name="businessId" value={businessId} />
      <Field
        label="Owner's email"
        hint="If they're already on GoDesi, use the email they joined with."
      >
        <input
          name="email"
          type="email"
          required
          className={inputClass}
          placeholder="owner@example.com"
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Owner's name" hint="Only used for a new account.">
          <input name="name" className={inputClass} />
        </Field>
        <Field label="Phone / WhatsApp" hint="Optional.">
          <input name="phone" type="tel" className={inputClass} />
        </Field>
      </div>
      <SubmitButton pendingLabel="Handing over...">
        Hand listing to this owner
      </SubmitButton>
    </form>
  );
}
