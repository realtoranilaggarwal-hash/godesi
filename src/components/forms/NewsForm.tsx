"use client";

import { useFormState } from "react-dom";
import { submitNewsAction } from "@/app/actions/news";
import { emptyState } from "@/lib/actions";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";

export function NewsForm({ isAdmin }: { isAdmin: boolean }) {
  const [state, formAction] = useFormState(submitNewsAction, emptyState);

  return (
    <form action={formAction} className="space-y-3">
      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      <Field label="Headline">
        <input name="title" required className={inputClass} />
      </Field>
      <Field label="Summary" hint="Two lines is plenty">
        <textarea name="summary" rows={3} required className={inputClass} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Article link">
          <input name="link" type="url" required className={inputClass} />
        </Field>
        <Field label="Image URL">
          <input name="imageUrl" type="url" className={inputClass} />
        </Field>
      </div>

      <SubmitButton pendingLabel="Submitting...">
        {isAdmin ? "Publish story" : "Submit for review"}
      </SubmitButton>
    </form>
  );
}
