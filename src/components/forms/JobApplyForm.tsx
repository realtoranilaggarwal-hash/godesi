"use client";

import { useFormState } from "react-dom";
import { applyJobAction } from "@/app/actions/jobs";
import { emptyState } from "@/lib/actions";
import { Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/forms/FormError";
import { FormSuccess } from "@/components/forms/FormSuccess";

export function JobApplyForm({ jobId }: { jobId: string }) {
  const [state, formAction] = useFormState(applyJobAction, emptyState);
  if (state.success) return <FormSuccess>{state.success}</FormSuccess>;

  return (
    <form action={formAction} className="space-y-3">
      <FormError>{state.error}</FormError>
      <input type="hidden" name="jobId" value={jobId} />
      <Field
        label="Why you're a good fit"
        required
        hint="Your experience, languages, and when you can start"
      >
        <textarea
          name="message"
          required
          rows={5}
          minLength={20}
          maxLength={1500}
          className={inputClass}
        />
      </Field>
      <Field label="Phone" hint="Optional, so the poster can call you">
        <input name="phone" type="tel" maxLength={30} className={inputClass} />
      </Field>
      <p className="text-xs text-slate-500">
        The poster sees your name, email, phone and message.
      </p>
      <SubmitButton pendingLabel="Sending...">Apply for this job</SubmitButton>
    </form>
  );
}
