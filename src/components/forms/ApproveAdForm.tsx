"use client";

import { useFormState } from "react-dom";
import { approveBannerAction } from "@/app/actions/admin";
import { emptyState } from "@/lib/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/forms/FormError";
import { FormSuccess } from "@/components/forms/FormSuccess";

export function ApproveAdForm({ id, capacity }: { id: string; capacity: number }) {
  const [state, formAction] = useFormState(approveBannerAction, emptyState);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <label className="text-xs font-medium text-slate-600">
        Slot
        <input
          name="position"
          type="number"
          min={1}
          max={capacity}
          placeholder="auto"
          className="ml-1 w-20 rounded-lg border border-slate-300 px-2 py-1 text-xs"
        />
      </label>
      <SubmitButton className="!px-3 !py-1 !text-xs" pendingLabel="Approving...">
        Approve
      </SubmitButton>
      <FormError>{state.error}</FormError>
      <FormSuccess>{state.success}</FormSuccess>
    </form>
  );
}
