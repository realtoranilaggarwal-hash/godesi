"use client";

import { useFormState } from "react-dom";
import { shareCardLeadAction } from "@/app/actions/card";
import { emptyState } from "@/lib/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { Field, inputClass } from "@/components/ui";
import { FormError } from "@/components/forms/FormError";
import { FormSuccess } from "@/components/forms/FormSuccess";

/**
 * The "share your info" half of the digital card — the visitor's details land
 * in the business owner's dashboard as a lead.
 */
export function CardLeadForm({
  slug,
  submitLabel = "Share my contact",
  pendingLabel = "Sharing…",
}: {
  slug: string;
  /** Performer listings say "Send booking request" instead. */
  submitLabel?: string;
  pendingLabel?: string;
}) {
  const [state, formAction] = useFormState(shareCardLeadAction, emptyState);

  if (state.success) {
    return <FormSuccess>{state.success}</FormSuccess>;
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="slug" value={slug} />
      {/* Honeypot — hidden from humans, bots fill it */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />
      <FormError>{state.error}</FormError>

      <Field label="Your name">
        <input
          name="name"
          required
          maxLength={80}
          placeholder="e.g. Priya Sharma"
          className={inputClass}
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Phone or WhatsApp">
          <input
            name="phone"
            type="tel"
            maxLength={30}
            placeholder="+1 732 555 0100"
            className={inputClass}
          />
        </Field>
        <Field label="Email">
          <input
            name="email"
            type="email"
            maxLength={120}
            placeholder="you@email.com"
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="Anything to add?" hint="Optional">
        <input
          name="note"
          maxLength={500}
          placeholder="e.g. looking for a realtor in Edison"
          className={inputClass}
        />
      </Field>

      <SubmitButton className="w-full" pendingLabel={pendingLabel}>
        {submitLabel}
      </SubmitButton>
      <p className="text-center text-xs text-slate-400">
        Your details go straight to the business owner.
      </p>
    </form>
  );
}
