"use client";

import { useFormState } from "react-dom";
import { inviteFriendsAction } from "@/app/actions/invites";
import { emptyState } from "@/lib/actions";
import { INVITE_MAX_PER_SUBMIT } from "@/lib/inviteLimits";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/forms/FormError";
import { FormSuccess } from "@/components/forms/FormSuccess";

export function InviteFriends({ signupPoints }: { signupPoints: number }) {
  const [state, formAction] = useFormState(inviteFriendsAction, emptyState);

  return (
    <form action={formAction} className="space-y-3">
      <FormError>{state.error}</FormError>
      <FormSuccess>{state.success}</FormSuccess>

      <label className="block text-sm font-semibold text-slate-700">
        Your friends&apos; email addresses
        <textarea
          name="emails"
          rows={4}
          required
          placeholder={"ravi@gmail.com, meera@yahoo.com\npriya@outlook.com"}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
      </label>
      <p className="text-xs text-slate-500">
        Up to {INVITE_MAX_PER_SUBMIT} at a time — commas or one per line. We only
        email the addresses you type here, once each, and every invite carries an
        opt-out link.
      </p>

      <label className="block text-sm font-semibold text-slate-700">
        A line from you (optional)
        <input
          name="note"
          maxLength={300}
          placeholder="Take your name before someone else does!"
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
      </label>

      <SubmitButton
        pendingLabel="Sending..."
        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
      >
        Send invites
      </SubmitButton>
      <p className="text-xs text-slate-500">
        You get {signupPoints} points when a friend actually joins — not for
        sending. Points spend on promotion, ads, membership, Connect and Elite.
      </p>
    </form>
  );
}
