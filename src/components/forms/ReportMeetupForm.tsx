"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { reportMeetupProfileAction } from "@/app/actions/meetups";
import { emptyState } from "@/lib/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { inputClass } from "@/components/ui";

export function ReportMeetupForm({ profileId }: { profileId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(reportMeetupProfileAction, emptyState);

  if (state.success) {
    return <p className="text-xs text-emerald-700">{state.success}</p>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-slate-500 hover:text-rose-600"
      >
        Report this profile
      </button>
    );
  }

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="profileId" value={profileId} />
      <input
        name="reason"
        required
        placeholder="What is wrong with this profile?"
        aria-label="Reason for reporting"
        className={inputClass}
      />
      {state.error ? <p className="text-xs text-rose-600">{state.error}</p> : null}
      <SubmitButton pendingLabel="Sending…">Send report</SubmitButton>
    </form>
  );
}
