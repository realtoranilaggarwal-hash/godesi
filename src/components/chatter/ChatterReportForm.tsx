"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { reportChatterPostAction } from "@/app/actions/chatter";
import { emptyState } from "@/lib/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { inputClass } from "@/components/ui";

export function ChatterReportForm({ postId }: { postId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(reportChatterPostAction, emptyState);

  if (state.success) {
    return <span className="text-xs text-emerald-700">{state.success}</span>;
  }
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-slate-500 hover:text-rose-600"
      >
        🚩 Report
      </button>
    );
  }
  return (
    <form
      action={formAction}
      className="flex w-full flex-wrap items-center gap-2"
    >
      <input type="hidden" name="postId" value={postId} />
      <input
        name="reason"
        required
        maxLength={300}
        placeholder="What is wrong with this post?"
        aria-label="Reason for reporting"
        className={`${inputClass} flex-1`}
      />
      <SubmitButton pendingLabel="Sending…" variant="secondary">
        Send report
      </SubmitButton>
      {state.error ? (
        <p className="w-full text-xs text-rose-600">{state.error}</p>
      ) : null}
    </form>
  );
}
