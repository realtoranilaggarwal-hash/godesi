"use client";

import { useFormState } from "react-dom";
import { addPackageAction } from "@/app/actions/packages";
import { emptyState } from "@/lib/actions";
import { Alert, Field, inputClass } from "@/components/ui";
import { CurrencySelect } from "@/components/forms/CurrencySelect";
import { SubmitButton } from "@/components/SubmitButton";

export function PackageForm({ defaultCurrency }: { defaultCurrency: string }) {
  const [state, formAction] = useFormState(addPackageAction, emptyState);

  return (
    <form action={formAction} className="space-y-3">
      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Package name" hint="e.g. Gold wedding shoot">
          <input name="name" required className={inputClass} />
        </Field>
        <Field label="Price">
          <input name="price" type="number" min={0} required className={inputClass} />
        </Field>
        <CurrencySelect defaultValue={defaultCurrency} />
      </div>
      <Field label="What's included">
        <textarea name="description" rows={2} className={inputClass} />
      </Field>
      <SubmitButton pendingLabel="Adding...">Add package</SubmitButton>
    </form>
  );
}
