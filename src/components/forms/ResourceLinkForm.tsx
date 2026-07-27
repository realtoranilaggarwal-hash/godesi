"use client";

import { useFormState } from "react-dom";
import { saveResourceLinkAction } from "@/app/actions/resources";
import { emptyState } from "@/lib/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { Alert, Field, inputClass } from "@/components/ui";

export function ResourceLinkForm({
  categories,
}: {
  categories: { slug: string; name: string }[];
}) {
  const [state, formAction] = useFormState(saveResourceLinkAction, emptyState);

  return (
    <form action={formAction} className="space-y-3">
      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Title">
          <input name="title" required maxLength={90} className={inputClass} />
        </Field>
        <Field label="URL">
          <input name="url" type="url" required className={inputClass} />
        </Field>
        <Field label="Category" hint="Blank shows the link everywhere">
          <select name="categorySlug" defaultValue="" className={inputClass}>
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tag" hint="Optional">
          <input name="tag" maxLength={30} className={inputClass} />
        </Field>
        <Field label="Type">
          <select name="kind" defaultValue="EDITORIAL" className={inputClass}>
            <option value="EDITORIAL">Editorial</option>
            <option value="SPONSORED">Sponsored</option>
            <option value="AFFILIATE">Affiliate</option>
          </select>
        </Field>
        <Field label="Views purchased" hint="Blank for unlimited">
          <input name="impressionCap" type="number" min={1} className={inputClass} />
        </Field>
      </div>

      <SubmitButton>Add link</SubmitButton>
    </form>
  );
}
