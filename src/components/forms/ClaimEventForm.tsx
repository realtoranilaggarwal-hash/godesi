"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { claimEventAction } from "@/app/actions/eventClaims";
import { emptyState } from "@/lib/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { Field, inputClass } from "@/components/ui";
import { FormError } from "@/components/forms/FormError";
import { FormSuccess } from "@/components/forms/FormSuccess";
import { PhoneInput } from "@/components/forms/PhoneInput";
import { DIAL_CODE_HINT } from "@/lib/dialCodes";

/** Shown on events we listed from a public calendar, for the real organiser. */
export function ClaimEventForm({ eventId }: { eventId: string }) {
  const [state, formAction] = useFormState(claimEventAction, emptyState);
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
      >
        Claim this event — it&apos;s free
      </button>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="eventId" value={eventId} />
      <FormError>{state.error}</FormError>
      <FormSuccess>{state.success}</FormSuccess>

      <Field label="How do you run this event?">
        <textarea
          name="message"
          rows={3}
          required
          placeholder="I am the organiser / the temple secretary / the promoter — you can check with me at…"
          className={inputClass}
        />
      </Field>
      <Field
        label="Email"
        hint="An email on the event's own domain gets you verified fastest."
      >
        <input name="email" type="email" className={inputClass} />
      </Field>
      <Field label="Contact number" hint={`So we can verify. ${DIAL_CODE_HINT}`}>
        <PhoneInput name="phone" />
      </Field>

      <SubmitButton pendingLabel="Sending...">Send claim</SubmitButton>
    </form>
  );
}
