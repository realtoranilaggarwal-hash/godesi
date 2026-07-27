"use client";

import { useFormState } from "react-dom";
import { saveAdCreativeAction } from "@/app/actions/ads";
import { emptyState } from "@/lib/actions";
import { Alert, Field, inputClass } from "@/components/ui";
import { ImageField } from "@/components/forms/ImageField";
import { SubmitButton } from "@/components/SubmitButton";
import { DesignHelp } from "@/components/DesignHelp";

export function AdCreativeForm({
  id,
  title,
  imageUrl,
  linkUrl,
  size,
}: {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  size: { width: number; height: number };
}) {
  const [state, formAction] = useFormState(saveAdCreativeAction, emptyState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Ad title">
          <input name="title" defaultValue={title} required className={inputClass} />
        </Field>
        <ImageField
          name="imageUrl"
          label="Banner creative"
          purpose="banner"
          defaultValue={imageUrl}
          hint={`Use exactly ${size.width} × ${size.height} px for a sharp result`}
          previewClassName="h-24 w-40 rounded-xl object-contain bg-slate-50"
        />
        <Field label="Destination URL" hint="Where clicks should land">
          <input
            name="linkUrl"
            type="url"
            defaultValue={linkUrl}
            required
            className={inputClass}
          />
        </Field>
      </div>

      <DesignHelp size={size} />

      <SubmitButton>Save creative</SubmitButton>
    </form>
  );
}
