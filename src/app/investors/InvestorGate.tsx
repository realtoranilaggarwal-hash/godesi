"use client";

import { useFormState } from "react-dom";
import { unlockInvestorAction } from "@/app/actions/investor";
import { emptyState } from "@/lib/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/forms/FormError";

export function InvestorGate() {
  const [state, formAction] = useFormState(unlockInvestorAction, emptyState);
  return (
    <form action={formAction} className="space-y-3">
      <FormError>{state.error}</FormError>
      <input
        type="password"
        name="password"
        required
        autoFocus
        placeholder="Investor password"
        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center tracking-widest focus:border-indigo-500 focus:outline-none"
      />
      <SubmitButton
        pendingLabel="Opening…"
        className="w-full rounded-xl bg-slate-900 py-3 font-bold text-white hover:bg-slate-700"
      >
        Open the investor kit →
      </SubmitButton>
      <p className="text-center text-xs text-slate-400">
        Access stays open on this device for 30 days.
      </p>
    </form>
  );
}
