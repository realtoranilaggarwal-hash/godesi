"use client";

import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import { addMediaAction } from "@/app/actions/business";
import { emptyState } from "@/lib/actions";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { ImageDropzone } from "@/components/ImageDropzone";
import { FormError } from "@/components/forms/FormError";
import { FormSuccess } from "@/components/forms/FormSuccess";

export function AddMediaForm({
  used,
  limit,
}: {
  used: number;
  limit: number;
}) {
  const [state, formAction] = useFormState(addMediaAction, emptyState);
  const router = useRouter();
  const remaining = Math.max(limit - used, 0);

  return (
    <div className="space-y-4">
      {remaining ? (
        <ImageDropzone
          purpose="gallery"
          multiple
          label="Drag & drop photos here, or click to choose"
          hint={`${remaining} of ${limit} image slots left — we resize and compress automatically.`}
          onUploaded={() => router.refresh()}
        />
      ) : (
        <Alert tone="info">
          You have used all {limit} image slots. Remove one, or upgrade at /pricing for
          more.
        </Alert>
      )}

      <details className="rounded-xl border border-slate-200 p-3">
        <summary className="cursor-pointer text-sm font-semibold text-slate-700">
          Or add a media URL (images and videos)
        </summary>
        <form action={formAction} className="mt-3 space-y-3">
          <FormError>{state.error}</FormError>
          <FormSuccess>{state.success}</FormSuccess>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Media URL">
              <input name="url" required placeholder="https://..." className={inputClass} />
            </Field>
            <Field label="Type">
              <select name="type" defaultValue="IMAGE" className={inputClass}>
                <option value="IMAGE">Image</option>
                <option value="VIDEO">Video</option>
              </select>
            </Field>
            <Field label="Caption">
              <input name="caption" className={inputClass} />
            </Field>
          </div>

          <SubmitButton pendingLabel="Adding...">Add to gallery</SubmitButton>
        </form>
      </details>
    </div>
  );
}
