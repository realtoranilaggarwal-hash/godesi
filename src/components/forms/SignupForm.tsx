"use client";

import { useFormState } from "react-dom";
import { signupAction } from "@/app/actions/auth";
import { emptyState } from "@/lib/actions";
import { Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/forms/FormError";
import { OfferChips } from "@/components/OfferChips";
import { JoinGoalChips } from "@/components/JoinGoalChips";

export function SignupForm({
  defaultRole = "BUSINESS",
  next,
  handle,
}: {
  defaultRole?: string;
  next?: string;
  /** A name claimed on the homepage; saved as the member's godesi.com/<name>. */
  handle?: string;
}) {
  const [state, formAction] = useFormState(signupAction, emptyState);

  return (
    <form action={formAction} className="space-y-3">
      <FormError>{state.error}</FormError>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      {handle ? (
        <input type="hidden" name="username" value={handle} />
      ) : null}

      {/* Bots fill every field they find; people never see this one. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

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
      <fieldset className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
        <legend className="px-1 text-sm font-bold text-emerald-900">
          ✅ What would you like to do on GoDesi? (tick all that apply)
        </legend>
        <JoinGoalChips />
      </fieldset>
      <details open className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
        <summary className="cursor-pointer text-sm font-bold text-indigo-900">
          🎁 Unlock Your GoDesi Member Benefits (optional)
        </summary>
        <div className="mt-3">
          <OfferChips />
        </div>
      </details>
      <SubmitButton pendingLabel="Creating account..." className="w-full">
        Create account
      </SubmitButton>
    </form>
  );
}
