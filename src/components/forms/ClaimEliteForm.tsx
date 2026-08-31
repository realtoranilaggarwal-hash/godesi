"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { claimEliteEntryAction } from "@/app/actions/eliteClaims";
import { emptyState } from "@/lib/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { Field, inputClass } from "@/components/ui";
import { FormError } from "@/components/forms/FormError";
import { FormSuccess } from "@/components/forms/FormSuccess";
import { PhoneInput } from "@/components/forms/PhoneInput";
import { DIAL_CODE_HINT } from "@/lib/dialCodes";

/** Shown on profiles our team compiled, so the person can take theirs over. */
export function ClaimEliteForm({
  entryId,
  open = false,
}: {
  entryId: string;
  open?: boolean;
}) {
  const [state, formAction] = useFormState(claimEliteEntryAction, emptyState);
  const [expanded, setExpanded] = useState(open);

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600"
      >
        Claim this profile
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-4"
    >
      <input type="hidden" name="entryId" value={entryId} />
      <p className="text-sm font-semibold text-amber-900">Claim this profile</p>
      <FormError>{state.error}</FormError>
      <FormSuccess>{state.success}</FormSuccess>

      <Field label="Are you this person, or do you represent them?">
        <textarea
          name="message"
          rows={3}
          required
          placeholder="I am…, you can verify me at…, I am the assistant to…"
          className={inputClass}
        />
      </Field>
      <Field label="Work email" hint="An email on your own domain helps us verify faster.">
        <input name="email" type="email" className={inputClass} />
      </Field>
      <Field label="Contact number" hint={`So we can verify with you. ${DIAL_CODE_HINT}`}>
        <PhoneInput name="phone" />
      </Field>

      <SubmitButton pendingLabel="Sending...">Send claim</SubmitButton>
    </form>
  );
}
