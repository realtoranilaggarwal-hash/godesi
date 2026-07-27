"use client";

import { useFormState } from "react-dom";
import {
  adjustUserPointsAction,
  setRewardPointsAction,
} from "@/app/actions/adminRewards";
import { emptyState } from "@/lib/actions";
import { REASON_LABELS } from "@/lib/rewards";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";

/** Admin editor for the published point values. */
export function RewardPointsForm({ values }: { values: Record<string, number> }) {
  const [state, formAction] = useFormState(setRewardPointsAction, emptyState);

  return (
    <form action={formAction} className="space-y-3">
      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {Object.entries(values).map(([reason, points]) => (
          <Field key={reason} label={REASON_LABELS[reason as keyof typeof REASON_LABELS]}>
            <input
              name={reason}
              type="number"
              min={0}
              defaultValue={points}
              className={inputClass}
            />
          </Field>
        ))}
      </div>

      <SubmitButton pendingLabel="Saving…">Save point values</SubmitButton>
    </form>
  );
}

/** Manual credit or debit for a single member. */
export function PointsAdjustForm() {
  const [state, formAction] = useFormState(adjustUserPointsAction, emptyState);

  return (
    <form action={formAction} className="space-y-3">
      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Member email">
          <input name="email" type="email" required className={inputClass} />
        </Field>
        <Field label="Points" hint="Negative to deduct">
          <input name="points" type="number" required className={inputClass} />
        </Field>
        <Field label="Reason">
          <input name="note" required className={inputClass} />
        </Field>
      </div>

      <SubmitButton pendingLabel="Applying…">Adjust points</SubmitButton>
    </form>
  );
}
