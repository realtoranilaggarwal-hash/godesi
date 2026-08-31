"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { claimHandleAction } from "@/app/actions/profile";
import { emptyState } from "@/lib/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/forms/FormError";
import { FormSuccess } from "@/components/forms/FormSuccess";

/** The one-click take for a member who is already signed in. */
export function ClaimHandleForm({ handle }: { handle: string }) {
  const [state, formAction] = useFormState(claimHandleAction, emptyState);

  return (
    <form action={formAction} className="space-y-3">
      <FormError>{state.error}</FormError>
      <FormSuccess>{state.success}</FormSuccess>
      <input type="hidden" name="username" value={handle} />
      {state.success ? (
        <Link
          href={`/${handle}`}
          className="inline-block font-semibold text-indigo-600 hover:underline"
        >
          Open godesi.com/{handle} →
        </Link>
      ) : (
        <SubmitButton pendingLabel="Claiming…">
          Take godesi.com/{handle}
        </SubmitButton>
      )}
    </form>
  );
}
