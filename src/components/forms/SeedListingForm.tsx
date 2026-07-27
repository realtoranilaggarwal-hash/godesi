"use client";

import { useFormState } from "react-dom";
import { addSeedListingAction, importSeedListingsAction } from "@/app/actions/seedListings";
import { emptyState } from "@/lib/actions";
import { CategorySelect, type CategoryOption } from "@/components/forms/CategorySelect";
import { SubmitButton } from "@/components/SubmitButton";
import { Alert, Field, inputClass } from "@/components/ui";

const CSV_TEMPLATE =
  "name,city,categorySlug,subcategorySlug,state,phone,whatsappNumber,websiteUrl,address,description";

/** Admin-only: seed a starter listing that a business can later claim. */
export function SeedListingForm({ categories }: { categories: CategoryOption[] }) {
  const [state, formAction] = useFormState(addSeedListingAction, emptyState);

  return (
    <form action={formAction} className="space-y-3">
      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Business name">
          <input name="name" required className={inputClass} />
        </Field>
        <Field label="City">
          <input name="city" required className={inputClass} />
        </Field>
        <CategorySelect categories={categories} required={false} />
        <Field label="State">
          <input name="state" className={inputClass} />
        </Field>
        <Field label="Phone">
          <input name="phone" className={inputClass} />
        </Field>
        <Field label="WhatsApp" hint="Optional until the owner claims it">
          <input name="whatsappNumber" className={inputClass} />
        </Field>
        <Field label="Website">
          <input name="websiteUrl" type="url" placeholder="https://" className={inputClass} />
        </Field>
      </div>

      <SubmitButton pendingLabel="Adding…">Add seed listing</SubmitButton>
    </form>
  );
}

/** Admin-only: paste or upload a small CSV batch of starter listings. */
export function SeedListingImportForm() {
  const [state, formAction] = useFormState(importSeedListingsAction, emptyState);

  return (
    <form action={formAction} className="space-y-3">
      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      <Field
        label="CSV rows"
        hint={`Up to 100 rows. Columns: ${CSV_TEMPLATE}`}
      >
        <textarea
          name="csv"
          rows={5}
          placeholder={`${CSV_TEMPLATE}\nSharma Sweets,Edison,food-catering,,NJ,,19735550123,,`}
          className={`${inputClass} font-mono text-xs`}
        />
      </Field>

      <Field label="…or upload a .csv file">
        <input name="file" type="file" accept=".csv,text/csv" className={inputClass} />
      </Field>

      <SubmitButton pendingLabel="Importing…">Import listings</SubmitButton>
    </form>
  );
}
