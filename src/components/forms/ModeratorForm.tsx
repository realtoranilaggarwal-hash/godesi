"use client";

import { useFormState } from "react-dom";
import { grantModeratorAction } from "@/app/actions/team";
import { emptyState } from "@/lib/actions";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";

export function ModeratorForm() {
  const [state, formAction] = useFormState(grantModeratorAction, emptyState);

  return (
    <form action={formAction} className="space-y-3">
      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      <Field
        label="Member email"
        hint="They must have a Godesi account already"
      >
        <input name="email" type="email" required className={inputClass} />
      </Field>
      <SubmitButton>Make moderator</SubmitButton>
    </form>
  );
}
