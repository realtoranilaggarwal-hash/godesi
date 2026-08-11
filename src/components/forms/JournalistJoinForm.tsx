"use client";

import { useFormState } from "react-dom";
import { joinJournalistAction } from "@/app/actions/journalist";
import { emptyState } from "@/lib/actions";
import { Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/forms/FormError";
import { FormSuccess } from "@/components/forms/FormSuccess";

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
      <FormSuccess>{state.success}</FormSuccess>

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
