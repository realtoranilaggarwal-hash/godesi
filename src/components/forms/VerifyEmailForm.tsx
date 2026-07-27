"use client";

import { useState, useTransition } from "react";
import { useFormState } from "react-dom";
import { sendEmailOtpAction, verifyEmailOtpAction } from "@/app/actions/verify";
import { emptyState, type ActionState } from "@/lib/actions";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";

export function VerifyEmailForm({ email }: { email: string }) {
  const [state, formAction] = useFormState(verifyEmailOtpAction, emptyState);
  const [resend, setResend] = useState<ActionState>({});
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        We emailed a 6-digit code to <span className="font-semibold">{email}</span>. Enter
        it below to verify your account.
      </p>

      {state.error ? <Alert>{state.error}</Alert> : null}
      {resend.error ? <Alert>{resend.error}</Alert> : null}
      {resend.success ? <Alert tone="success">{resend.success}</Alert> : null}

      <form action={formAction} className="space-y-3">
        <Field label="Verification code">
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
        <SubmitButton pendingLabel="Verifying...">Verify email</SubmitButton>
      </form>

      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setResend(await sendEmailOtpAction());
          })
        }
        className="text-sm font-semibold text-indigo-600 hover:underline disabled:opacity-50"
      >
        {pending ? "Sending..." : "Send me a new code"}
      </button>
    </div>
  );
}
