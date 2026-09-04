"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  approveDesignAction,
  requestChangesAction,
  rerollDesignAction,
} from "@/app/actions/websiteBuilder";
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

/** Screen 4's three big buttons; "changes" opens a notes box under them. */
export function PreviewActions({ id, changeNotes }: { id: string; changeNotes: string | null }) {
  const [editing, setEditing] = useState(false);
  const [state, changesAction] = useFormState(requestChangesAction.bind(null, id), emptyState);

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-3">
        <form action={approveDesignAction.bind(null, id)}>
          <Pending
            idle="👍 I LOVE IT — MAKE MY WEBSITE LIVE"
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
          ✏️ I WANT TO MAKE CHANGES
        </Button>
        <form action={rerollDesignAction.bind(null, id)}>
          <Pending
            idle="🔄 SHOW ME ANOTHER DESIGN"
            busy="Redesigning…"
            className="w-full bg-fuchsia-600 py-3 hover:bg-fuchsia-700"
          />
        </form>
      </div>

      {editing ? (
        <form action={changesAction} className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
          <FormError>{state.error}</FormError>
          <label className="block text-sm font-medium text-slate-700">
            What should we change? Words, services, tone — anything.
            <textarea
              name="notes"
              rows={3}
              required
              maxLength={2000}
              defaultValue={changeNotes ?? ""}
              placeholder='e.g. "Mention we do catering for weddings, and make it sound warmer"'
              className={`${inputClass} mt-1`}
            />
          </label>
          <p className="text-xs text-slate-500">
            Colours and layout? Use &ldquo;Show me another design&rdquo; instead — it keeps your
            words and changes the look.
          </p>
          <div className="flex justify-end">
            <Pending idle="Rewrite my preview" busy="Rewriting…" className="" />
          </div>
        </form>
      ) : null}
    </div>
  );
}
