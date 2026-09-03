"use client";

import type { ReactNode } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { type ActionState, emptyState } from "@/lib/actions";
import { Button, type ButtonVariant } from "@/components/ui";

type FormAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

function Submit({
  label,
  pendingLabel,
  variant,
}: {
  label: string;
  pendingLabel: string;
  variant: ButtonVariant;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} disabled={pending}>
      {pending ? pendingLabel : label}
    </Button>
  );
}

/**
 * One form wrapper for every gig action: renders the fields it is given, the
 * submit button, and the action's error or success line.
 */
export function ActionForm({
  action,
  children,
  submitLabel,
  pendingLabel = "Saving…",
  variant = "primary",
  className = "",
  resetOnSuccess = false,
}: {
  action: FormAction;
  children: ReactNode;
  submitLabel: string;
  pendingLabel?: string;
  variant?: ButtonVariant;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction] = useFormState(action, emptyState);
  return (
    <form
      action={formAction}
      className={`space-y-3 ${className}`}
      key={resetOnSuccess && state.success ? state.success : undefined}
    >
      {children}
      <div className="flex flex-wrap items-center gap-3">
        <Submit label={submitLabel} pendingLabel={pendingLabel} variant={variant} />
        {state.error ? (
          <p className="text-sm font-semibold text-rose-600">{state.error}</p>
        ) : null}
        {state.success ? (
          <p className="text-sm font-semibold text-emerald-700">{state.success}</p>
        ) : null}
      </div>
    </form>
  );
}
