"use client";

import { useFormState } from "react-dom";
import { saveNewsFeedAction } from "@/app/actions/admin";
import { emptyState } from "@/lib/actions";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";

export function NewsFeedForm() {
  const [state, formAction] = useFormState(saveNewsFeedAction, emptyState);

  return (
    <form action={formAction} className="space-y-3">
      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Feed name">
          <input name="name" required className={inputClass} />
        </Field>
        <Field label="RSS / Atom URL">
          <input name="url" type="url" required className={inputClass} />
        </Field>
      </div>

      <SubmitButton>Add feed</SubmitButton>
    </form>
  );
}
