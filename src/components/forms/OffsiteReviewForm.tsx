"use client";

import { useFormState } from "react-dom";
import { addOffsiteReviewAction } from "@/app/actions/reviews";
import { emptyState } from "@/lib/actions";
import { Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/forms/FormError";
import { FormSuccess } from "@/components/forms/FormSuccess";

const SOURCES = [
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "EMAIL", label: "Email" },
  { value: "PHONE", label: "Phone call" },
  { value: "IN_PERSON", label: "In person" },
];

/** Staff desk for reviews customers sent privately instead of posting here. */
export function OffsiteReviewForm() {
  const [state, formAction] = useFormState(addOffsiteReviewAction, emptyState);

  return (
    <form action={formAction} className="space-y-3">
      <FormError>{state.error}</FormError>
      <FormSuccess>{state.success}</FormSuccess>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Business page"
          hint="The slug or the full /b/… link"
        >
          <input
            name="businessSlug"
            required
            placeholder="sharma-sweets-edison"
            className={inputClass}
          />
        </Field>
        <Field label="Customer name" hint="First name and city is enough">
          <input
            name="authorName"
            required
            placeholder="Priya S., Edison"
            className={inputClass}
          />
        </Field>
        <Field label="Rating">
          <select name="rating" defaultValue="5" className={inputClass}>
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {"★".repeat(value)} {value}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Where it came from">
          <select name="source" defaultValue="WHATSAPP" className={inputClass}>
            {SOURCES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        label="What the customer wrote"
        hint="Paste their words. Take out phone numbers and addresses — the save is blocked if a number is left in."
      >
        <textarea
          name="comment"
          rows={3}
          required
          className={inputClass}
          placeholder="Ordered sweets for my daughter's engagement…"
        />
      </Field>

      <label className="flex items-start gap-2 text-sm text-slate-700">
        <input type="checkbox" name="consent" className="mt-0.5 h-4 w-4" />
        <span>
          The customer agreed their words and first name can be published on
          Godesi. Their number is never shown.
        </span>
      </label>

      <SubmitButton>Add the review</SubmitButton>
    </form>
  );
}
