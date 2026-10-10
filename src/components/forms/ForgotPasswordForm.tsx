"use client";

import { useFormState } from "react-dom";
import {
  requestPasswordResetAction,
  resetPasswordAction,
} from "@/app/actions/password";
import { emptyState } from "@/lib/actions";
import { Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/forms/FormError";

export function RequestResetForm({ email }: { email?: string }) {
  const [state, formAction] = useFormState(
    requestPasswordResetAction,
    emptyState,
  );

  return (
    <form action={formAction} className="space-y-3">
      <FormError>{state.error}</FormError>
      <Field label="Email you joined with">
        <input
          name="email"
          type="email"
          required
          defaultValue={email}
          autoComplete="email"
          className={inputClass}
        />
      </Field>
      <SubmitButton pendingLabel="Sending..." className="w-full">
        Email me a code
      </SubmitButton>
    </form>
  );
}

export function ResetPasswordForm({ email }: { email: string }) {
  const [state, formAction] = useFormState(resetPasswordAction, emptyState);

  return (
    <form action={formAction} className="space-y-3">
      <FormError>{state.error}</FormError>
      <input type="hidden" name="email" value={email} />
      <Field label="6-digit code from the email">
        <input
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          required
          placeholder="123456"
          className={`${inputClass} text-center text-2xl font-bold tracking-[0.5em]`}
        />
      </Field>
      <Field label="New password (8+ characters)">
        <input
          name="password"
          type="password"
          minLength={8}
          required
          autoComplete="new-password"
          className={inputClass}
        />
      </Field>
      <Field label="Type it again">
        <input
          name="confirm"
          type="password"
          minLength={8}
          required
          autoComplete="new-password"
          className={inputClass}
        />
      </Field>
      <SubmitButton pendingLabel="Saving..." className="w-full">
        Set new password and sign in
      </SubmitButton>
    </form>
  );
}
