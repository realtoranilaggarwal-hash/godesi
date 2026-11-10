"use client";

import { useFormState, useFormStatus } from "react-dom";
import { requestSiteChangeAction } from "@/app/actions/websiteBuilder";
import { emptyState } from "@/lib/actions";
import { Button, inputClass } from "@/components/ui";
import { FormError } from "@/components/forms/FormError";

function Send() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Sending…" : "Send change request"}
    </Button>
  );
}

/** The "Request a change" box on a paid site's page. */
export function SiteChangeForm({ id, disabled }: { id: string; disabled: boolean }) {
  const [state, action] = useFormState(requestSiteChangeAction.bind(null, id), emptyState);
  return (
    <form action={action} className="space-y-2" key={state.success}>
      <FormError>{state.error}</FormError>
      {state.success ? (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{state.success}</p>
      ) : null}
      <textarea
        name="text"
        rows={3}
        required
        maxLength={3000}
        disabled={disabled}
        aria-label="What should we change on your website?"
        placeholder='e.g. "Change our Saturday hours to 10–4 and add the new Diwali offer photo"'
        className={inputClass}
      />
      <div className="flex justify-end">
        <Send />
      </div>
    </form>
  );
}
