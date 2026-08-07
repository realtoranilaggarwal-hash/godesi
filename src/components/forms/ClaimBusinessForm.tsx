"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { claimBusinessAction } from "@/app/actions/claims";
import { emptyState } from "@/lib/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { Field, inputClass } from "@/components/ui";
import { FormError } from "@/components/forms/FormError";
import { PhoneInput } from "@/components/forms/PhoneInput";
import { DIAL_CODE_HINT } from "@/lib/dialCodes";
import { FormSuccess } from "@/components/forms/FormSuccess";

/** Shown on unowned starter listings so the real business can take them over. */
export function ClaimBusinessForm({
  businessId,
  open = false,
}: {
  businessId: string;
  open?: boolean;
}) {
  const [state, formAction] = useFormState(claimBusinessAction, emptyState);
  const [expanded, setExpanded] = useState(open);

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600"
      >
        Is this your business? Claim it
      </button>
    );
  }

  return (
    <form action={formAction} className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <input type="hidden" name="businessId" value={businessId} />
      <p className="text-sm font-semibold text-amber-900">Claim this listing</p>
      <FormError>{state.error}</FormError>
      <FormSuccess>{state.success}</FormSuccess>

      <Field label="How are you connected to this business?">
        <textarea
          name="message"
          rows={3}
          required
          placeholder="I'm the owner of…, our shop is at…, you can verify on…"
          className={inputClass}
        />
      </Field>
      <Field
        label="Contact number"
        hint={`So we can verify with you. ${DIAL_CODE_HINT}`}
      >
        <PhoneInput name="phone" />
      </Field>

      <SubmitButton pendingLabel="Sending...">Submit claim</SubmitButton>
    </form>
  );
}
