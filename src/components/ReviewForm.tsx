"use client";

import { useFormState } from "react-dom";
import { createReviewAction } from "@/app/actions/reviews";
import { emptyState } from "@/lib/actions";
import { REVIEW_CRITERIA } from "@/lib/agents";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";

export function ReviewForm({
  businessId,
  defaultName,
  detailed = false,
}: {
  businessId: string;
  defaultName?: string;
  /** Agent cards collect per-criteria scores as well as the overall rating. */
  detailed?: boolean;
}) {
  const [state, formAction] = useFormState(createReviewAction, emptyState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="businessId" value={businessId} />
      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Your name">
          <input
            name="authorName"
            defaultValue={defaultName ?? ""}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Rating">
          <select name="rating" defaultValue="5" className={inputClass}>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {"★".repeat(n)} ({n})
              </option>
            ))}
          </select>
        </Field>
      </div>

      {detailed ? (
        <fieldset className="rounded-2xl border border-slate-200 p-4">
          <legend className="px-1 text-sm font-bold text-slate-900">
            Rate the details
          </legend>
          <div className="mt-1 grid gap-3 sm:grid-cols-2">
            {REVIEW_CRITERIA.map((criterion) => (
              <Field key={criterion.id} label={criterion.label}>
                <select name={criterion.id} defaultValue="5" className={inputClass}>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </Field>
            ))}
          </div>
        </fieldset>
      ) : null}

      <Field label="Comment">
        <textarea name="comment" rows={3} className={inputClass} />
      </Field>

      <SubmitButton pendingLabel="Posting...">Post review</SubmitButton>
    </form>
  );
}
