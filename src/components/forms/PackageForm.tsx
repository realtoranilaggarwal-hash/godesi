"use client";

import { useFormState } from "react-dom";
import { addPackageAction } from "@/app/actions/packages";
import { emptyState } from "@/lib/actions";
import { Field, inputClass } from "@/components/ui";
import { CurrencySelect } from "@/components/forms/CurrencySelect";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/forms/FormError";
import { FormSuccess } from "@/components/forms/FormSuccess";

export function PackageForm({ defaultCurrency }: { defaultCurrency: string }) {
  const [state, formAction] = useFormState(addPackageAction, emptyState);

  return (
    <form action={formAction} className="space-y-3">
      <FormError>{state.error}</FormError>
      <FormSuccess>{state.success}</FormSuccess>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Package name" hint="e.g. Gold wedding shoot">
          <input name="name" required className={inputClass} />
        </Field>
        <Field label="Price">
          <input name="price" type="number" min={0} required className={inputClass} />
        </Field>
        <CurrencySelect defaultValue={defaultCurrency} />
      </div>
      <Field label="Short description">
        <textarea name="description" rows={2} className={inputClass} />
      </Field>
      <Field label="What's included" hint="One item per line, e.g. 8 hours coverage">
        <textarea
          name="includes"
          rows={4}
          placeholder={"8 hours coverage\n300 edited photos\nOnline gallery"}
          className={inputClass}
        />
      </Field>
      <SubmitButton pendingLabel="Adding...">Add package</SubmitButton>
    </form>
  );
}
