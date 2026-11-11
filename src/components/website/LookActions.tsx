"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { approveLookAction, lookChangesAction } from "@/app/actions/websiteBuilder";
import { emptyState } from "@/lib/actions";
import { Button, inputClass } from "@/components/ui";
import { FormError } from "@/components/forms/FormError";

function Pending({ idle, busy, className }: { idle: string; busy: string; className: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className={className}>
      {pending ? busy : idle}
    </Button>
  );
}

/** The two buttons under a custom design preview. */
export function LookActions({ token, priceLine, code }: { token: string; priceLine: string; code?: string }) {
  const [editing, setEditing] = useState(false);
  const [state, changesAction] = useFormState(lookChangesAction.bind(null, token), emptyState);

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <form action={approveLookAction.bind(null, token, code)}>
          <Pending
            idle="👍 I LOVE IT — LAUNCH MY WEBSITE"
            busy="One moment…"
            className="w-full bg-emerald-600 py-3 hover:bg-emerald-700"
          />
        </form>
        <Button
          type="button"
          variant="secondary"
          className="w-full py-3"
          onClick={() => setEditing((current) => !current)}
        >
          ✏️ I WANT CHANGES
        </Button>
      </div>
      <p className="text-center text-xs text-slate-500">{priceLine}</p>

      {editing || state.success ? (
        <form action={changesAction} className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
          <FormError>{state.error}</FormError>
          {state.success ? (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{state.success}</p>
          ) : null}
          <label className="block text-sm font-medium text-slate-700">
            What should we change? Words, photos, colours, pages — anything.
            <textarea
              name="notes"
              rows={4}
              required
              maxLength={3000}
              placeholder='e.g. "Use our new logo, add a page for visa services, make the header blue"'
              className={`${inputClass} mt-1`}
            />
          </label>
          <div className="flex justify-end">
            <Pending idle="Send my changes" busy="Sending…" className="" />
          </div>
        </form>
      ) : null}
    </div>
  );
}
