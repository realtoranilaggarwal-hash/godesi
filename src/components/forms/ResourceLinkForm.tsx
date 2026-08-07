"use client";

import { useFormState } from "react-dom";
import { saveResourceLinkAction } from "@/app/actions/resources";
import { emptyState } from "@/lib/actions";
import { RESOURCE_PLACEMENTS } from "@/lib/resources";
import { SubmitButton } from "@/components/SubmitButton";
import { Field, inputClass } from "@/components/ui";
import { FormError } from "@/components/forms/FormError";
import { FormSuccess } from "@/components/forms/FormSuccess";

export function ResourceLinkForm({
  categories,
}: {
  categories: { slug: string; name: string }[];
}) {
  const [state, formAction] = useFormState(saveResourceLinkAction, emptyState);

  return (
    <form action={formAction} className="space-y-3">
      <FormError>{state.error}</FormError>

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
        <Field label="Tags" hint="Comma separated — these build the tag cloud">
          <input
            name="tags"
            maxLength={200}
            placeholder="visa, immigration, jobs"
            className={inputClass}
          />
        </Field>
        <Field
          label="One-line description"
          hint="Shown next to the link — max 140 characters"
        >
          <input name="description" maxLength={140} className={inputClass} />
        </Field>
        <Field label="Type">
          <select name="kind" defaultValue="EDITORIAL" className={inputClass}>
            <option value="EDITORIAL">Editorial</option>
            <option value="SPONSORED">Sponsored</option>
            <option value="AFFILIATE">Affiliate</option>
          </select>
        </Field>
        <Field
          label="Special rail"
          hint="Pins the link to one rail instead of the category boxes"
        >
          <select name="placement" defaultValue="" className={inputClass}>
            <option value="">Normal category boxes</option>
            {RESOURCE_PLACEMENTS.map((placement) => (
              <option key={placement.value} value={placement.value}>
                {placement.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Views purchased" hint="Blank for unlimited">
          <input name="impressionCap" type="number" min={1} className={inputClass} />
        </Field>
      </div>

      <FormSuccess>{state.success}</FormSuccess>
      <SubmitButton>Add link</SubmitButton>
    </form>
  );
}
