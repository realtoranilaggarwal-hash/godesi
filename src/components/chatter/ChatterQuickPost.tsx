"use client";

import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { createChatterPostAction } from "@/app/actions/chatter";
import { emptyState } from "@/lib/actions";
import { CHATTER_MAX } from "@/lib/chatterConstants";
import { SubmitButton } from "@/components/SubmitButton";

/** One-line Chatter post (general topic); errors and success show inline. */
export function ChatterQuickPost() {
  const [state, formAction] = useFormState(createChatterPostAction, emptyState);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) form.current?.reset();
  }, [state]);

  return (
    <form
      ref={form}
      action={formAction}
      className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:flex-1"
    >
      <input type="hidden" name="topic" value="general" />
      <input
        name="body"
        required
        maxLength={CHATTER_MAX}
        placeholder="What's on your mind? Add #words…"
        aria-label="Your Chatter post"
        className="min-w-0 flex-1 rounded-full border border-orange-200 bg-white px-3 py-1.5 text-sm focus:border-orange-400 focus:outline-none"
      />
      <SubmitButton
        pendingLabel="…"
        className="!rounded-full !px-3 !py-1.5 text-sm"
      >
        Post
      </SubmitButton>
      {state.error ? (
        <p className="w-full text-xs text-rose-600">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="w-full text-xs text-emerald-700">{state.success}</p>
      ) : null}
    </form>
  );
}
