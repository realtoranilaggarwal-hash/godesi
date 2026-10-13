"use client";

import { useFormState } from "react-dom";
import { saveHelpClipAction } from "@/app/actions/helpClips";
import { emptyState } from "@/lib/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { Field, inputClass } from "@/components/ui";
import { FormError } from "@/components/forms/FormError";
import { FormSuccess } from "@/components/forms/FormSuccess";

export function HelpClipForm({
  categories,
}: {
  categories: { slug: string; name: string; depth: number }[];
}) {
  const [state, formAction] = useFormState(saveHelpClipAction, emptyState);

  return (
    <form action={formAction} className="space-y-3">
      <FormError>{state.error}</FormError>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Title" hint="Shown on the card, e.g. How Godesi works">
          <input name="title" required maxLength={70} className={inputClass} />
        </Field>
        <Field label="YouTube or Vimeo link" hint="Shorts links work too">
          <input
            name="url"
            type="url"
            required
            placeholder="https://www.youtube.com/shorts/…"
            className={inputClass}
          />
        </Field>
        <Field label="One line under the title" hint="Optional, max 90 characters">
          <input
            name="note"
            maxLength={90}
            placeholder="10 seconds — find what you need"
            className={inputClass}
          />
        </Field>
        <Field
          label="Where it shows"
          hint="Blank shows it on every page; a category shows it only there"
        >
          <select name="categorySlug" defaultValue="" className={inputClass}>
            <option value="">Everywhere (welcome clip)</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.depth ? "— " : ""}
                {category.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Order" hint="Lower shows first when a page has more than one">
          <input
            name="sortOrder"
            type="number"
            min={0}
            max={999}
            defaultValue={0}
            className={inputClass}
          />
        </Field>
      </div>

      <FormSuccess>{state.success}</FormSuccess>
      <SubmitButton>Add clip</SubmitButton>
    </form>
  );
}
