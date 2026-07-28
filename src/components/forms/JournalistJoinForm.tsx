"use client";

import { useFormState } from "react-dom";
import { joinJournalistAction } from "@/app/actions/journalist";
import { emptyState } from "@/lib/actions";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/forms/FormError";

export function JournalistJoinForm({
  beat,
  label = "Become a local journalist",
}: {
  beat?: string | null;
  label?: string;
}) {
  const [state, formAction] = useFormState(joinJournalistAction, emptyState);

  return (
    <form action={formAction} className="space-y-3">
      <FormError>{state.error}</FormError>
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      <Field
        label="Which city or area will you cover?"
        hint="Example: Edison NJ, Brampton, Hyderabad — Gachibowli"
      >
        <input
          name="beat"
          required
          defaultValue={beat ?? ""}
          className={inputClass}
        />
      </Field>

      <SubmitButton pendingLabel="Saving...">{label}</SubmitButton>
    </form>
  );
}
