"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { deleteClubAction } from "@/app/actions/clubs";
import { emptyState } from "@/lib/actions";
import { Button, inputClass } from "@/components/ui";
import { FormError } from "@/components/forms/FormError";

function DeleteButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={disabled || pending}
      className="!bg-rose-600 hover:!bg-rose-700"
    >
      {pending ? "Deleting…" : "Delete this club"}
    </Button>
  );
}

/** Danger zone on the edit page: type the club's name, then delete. */
export function DeleteClubForm({
  clubId,
  clubName,
}: {
  clubId: string;
  clubName: string;
}) {
  const [state, formAction] = useFormState(deleteClubAction, emptyState);
  const [typed, setTyped] = useState("");
  const matches = typed.trim().toLowerCase() === clubName.trim().toLowerCase();

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="clubId" value={clubId} />
      <p className="text-sm text-slate-600">
        Deleting removes the club, its member list and any Premium record.
        Events posted under it stay on GoDesi, just without the club. This
        cannot be undone.
      </p>
      <label className="block text-sm">
        <span className="font-semibold text-slate-800">
          Type <span className="font-black">{clubName}</span> to confirm
        </span>
        <input
          name="confirmName"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          autoComplete="off"
          className={`${inputClass} mt-1`}
        />
      </label>
      <FormError>{state.error}</FormError>
      <DeleteButton disabled={!matches} />
    </form>
  );
}
