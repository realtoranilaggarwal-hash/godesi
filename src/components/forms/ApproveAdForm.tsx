"use client";

import { useFormState } from "react-dom";
import { approveBannerAction } from "@/app/actions/admin";
import { emptyState } from "@/lib/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/forms/FormError";
import { FormSuccess } from "@/components/forms/FormSuccess";

/** The number only orders the rotation, so there is no ceiling to enforce. */
export function ApproveAdForm({ id }: { id: string }) {
  const [state, formAction] = useFormState(approveBannerAction, emptyState);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <label className="text-xs font-medium text-slate-600">
        Order
        <input
          name="position"
          type="number"
          min={1}
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
