"use client";

import { useFormState } from "react-dom";
import { addAgentSaleAction } from "@/app/actions/agents";
import { emptyState } from "@/lib/actions";
import { SALE_SIDE_LABELS } from "@/lib/agents";
import { SubmitButton } from "@/components/SubmitButton";
import { Alert, Field, inputClass } from "@/components/ui";

export function AgentSaleForm() {
  const [state, formAction] = useFormState(addAgentSaleAction, emptyState);

  return (
    <form action={formAction} className="space-y-3">
      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Closed on">
          <input name="soldOn" type="date" required className={inputClass} />
        </Field>
        <Field label="Sale price">
          <input name="price" type="number" min={1} step="1" required className={inputClass} />
        </Field>
        <Field label="Address" hint="Street, city, state">
          <input name="address" required className={inputClass} />
        </Field>
        <Field label="You represented">
          <select name="side" defaultValue="SELLER" className={inputClass}>
            {Object.entries(SALE_SIDE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <SubmitButton>Add sale</SubmitButton>
    </form>
  );
}
