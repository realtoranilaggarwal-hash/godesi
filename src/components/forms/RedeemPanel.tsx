"use client";

import { useFormState } from "react-dom";
import { redeemPointsAction } from "@/app/actions/rewards";
import { emptyState } from "@/lib/actions";
import { REWARDS } from "@/lib/rewards";
import { Alert } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/forms/FormError";

export function RedeemPanel({ balance }: { balance: number }) {
  const [state, formAction] = useFormState(redeemPointsAction, emptyState);

  return (
    <div className="space-y-3">
      <FormError>{state.error}</FormError>
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      <ul className="space-y-2">
        {REWARDS.map((reward) => (
          <li
            key={reward.key}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2"
          >
            <span className="text-sm text-slate-700">{reward.label}</span>
            <form action={formAction} className="flex items-center gap-2">
              <input type="hidden" name="reward" value={reward.key} />
              <span className="text-xs font-bold text-slate-500">{reward.points} pts</span>
              <SubmitButton
                pendingLabel="Redeeming..."
                disabled={balance < reward.points}
                className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                Redeem
              </SubmitButton>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
