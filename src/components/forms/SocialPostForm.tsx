"use client";

import { useFormState } from "react-dom";
import { addSocialPostAction } from "@/app/actions/social";
import { emptyState } from "@/lib/actions";
import { SOCIAL_TAG } from "@/lib/social";
import { Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/forms/FormError";
import { FormSuccess } from "@/components/forms/FormSuccess";

/** Staff paste a public post link; we store a quote and link, never a copy. */
export function SocialPostForm() {
  const [state, formAction] = useFormState(addSocialPostAction, emptyState);

  return (
    <form action={formAction} className="space-y-3">
      <FormError>{state.error}</FormError>
      <FormSuccess>{state.success}</FormSuccess>

      <Field
        label="Link to the post"
        hint={`Any public #${SOCIAL_TAG} post on X, Instagram, Facebook, LinkedIn, YouTube or Threads`}
      >
        <input
          name="url"
          required
          placeholder="https://x.com/someone/status/123"
          className={inputClass}
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Who posted it">
          <input name="author" required className={inputClass} />
        </Field>
        <Field label="Handle" hint="Optional — we read it from the link if blank">
          <input name="handle" placeholder="@handle" className={inputClass} />
        </Field>
      </div>
      <Field label="Quote from the post" hint="A line or two — keep it short">
        <textarea name="text" required rows={3} maxLength={400} className={inputClass} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Image URL" hint="Optional">
          <input name="imageUrl" className={inputClass} />
        </Field>
        <Field label="Posted on" hint="Optional — defaults to now">
          <input name="postedAt" type="date" className={inputClass} />
        </Field>
      </div>

      <SubmitButton pendingLabel="Adding…">Add to the wall</SubmitButton>
    </form>
  );
}
