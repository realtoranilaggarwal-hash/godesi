"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { claimVenueAction } from "@/app/actions/venueClaims";
import { emptyState } from "@/lib/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { Field, inputClass } from "@/components/ui";
import { FormError } from "@/components/forms/FormError";
import { FormSuccess } from "@/components/forms/FormSuccess";
import { PhoneInput } from "@/components/forms/PhoneInput";
import { DIAL_CODE_HINT } from "@/lib/dialCodes";

/** "Is this your venue?" — the owner asks to manage the venue page. */
export function ClaimVenueForm({ venueId }: { venueId: string }) {
  const [state, formAction] = useFormState(claimVenueAction, emptyState);
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <p className="text-xs text-slate-600">
        Is this your venue?{" "}
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="font-semibold text-violet-700 hover:underline"
        >
          Claim it to edit its halls, address and website →
        </button>
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="venueId" value={venueId} />
      <FormError>{state.error}</FormError>
      <FormSuccess>{state.success}</FormSuccess>

      <Field label="How do you run this venue?">
        <textarea
          name="message"
          rows={3}
          required
          placeholder="I am the owner / the banquet manager — you can check with me at…"
          className={inputClass}
        />
      </Field>
      <Field
        label="Email"
        hint="An email on the venue's own domain gets you verified fastest."
      >
        <input name="email" type="email" className={inputClass} />
      </Field>
      <Field
        label="Contact number"
        hint={`So we can verify. ${DIAL_CODE_HINT}`}
      >
        <PhoneInput name="phone" />
      </Field>

      <SubmitButton pendingLabel="Sending...">Send claim</SubmitButton>
    </form>
  );
}
