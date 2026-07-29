"use client";

import { useFormState } from "react-dom";
import { createReviewAction } from "@/app/actions/reviews";
import { emptyState } from "@/lib/actions";
import { REVIEW_CRITERIA } from "@/lib/agents";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/forms/FormError";

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
      <FormError>{state.error}</FormError>
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

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        <p className="font-bold">Before you post — please read</p>
        <p className="mt-1">
          Write only about your own genuine experience. A review you know to be false can
          be defamation under the laws of your country and the business may take legal
          action against you. Godesi may share your account details if a court or lawful
          authority requires it, and removes reviews that are fake, abusive or paid for.
        </p>
        <label className="mt-2 flex items-start gap-2 font-semibold">
          <input type="checkbox" name="acceptTerms" required className="mt-0.5" />
          <span>
            This is my honest first-hand experience and I understand the legal
            consequences of posting something false.
          </span>
        </label>
      </div>

      <SubmitButton pendingLabel="Posting...">Post review</SubmitButton>
    </form>
  );
}
