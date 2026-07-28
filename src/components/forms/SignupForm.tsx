"use client";

import { useFormState } from "react-dom";
import { signupAction } from "@/app/actions/auth";
import { emptyState } from "@/lib/actions";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";

export function SignupForm({
  defaultRole = "BUSINESS",
  next,
}: {
  defaultRole?: string;
  next?: string;
}) {
  const [state, formAction] = useFormState(signupAction, emptyState);

  return (
    <form action={formAction} className="space-y-3">
      {state.error ? <Alert>{state.error}</Alert> : null}
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <Field label="I am a">
        <select name="role" defaultValue={defaultRole} className={inputClass}>
          <option value="BUSINESS">
            Business owner — shop, restaurant or company
          </option>
          <option value="PROFESSIONAL">
            Professional / freelancer — I work for clients, no shop
          </option>
          <option value="CLIENT">Client — I want to post requirements</option>
        </select>
      </Field>
      <Field label="Name">
        <input name="name" required className={inputClass} />
      </Field>
      <Field label="Email">
        <input name="email" type="email" required className={inputClass} />
      </Field>
      <Field label="Password" hint="At least 8 characters">
        <input name="password" type="password" required minLength={8} className={inputClass} />
      </Field>
      <SubmitButton pendingLabel="Creating account..." className="w-full">
        Create account
      </SubmitButton>
    </form>
  );
}
