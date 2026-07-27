"use client";

import { useFormState } from "react-dom";
import { loginAction } from "@/app/actions/auth";
import { emptyState } from "@/lib/actions";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useFormState(loginAction, emptyState);

  return (
    <form action={formAction} className="space-y-3">
      {state.error ? <Alert>{state.error}</Alert> : null}
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <Field label="Email">
        <input name="email" type="email" required className={inputClass} />
      </Field>
      <Field label="Password">
        <input name="password" type="password" required className={inputClass} />
      </Field>
      <SubmitButton pendingLabel="Signing in..." className="w-full">
        Sign in
      </SubmitButton>
    </form>
  );
}
