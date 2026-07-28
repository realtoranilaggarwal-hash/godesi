"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import type { Faith } from "@prisma/client";
import { submitWorshipAction } from "@/app/actions/worship";
import { emptyState } from "@/lib/actions";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { WriteHelper } from "@/components/WriteHelper";
import { ImageDropzone } from "@/components/ImageDropzone";
import { FAITHS, FAITH_LABELS } from "@/lib/worship";
import { FormError } from "@/components/forms/FormError";

export function WorshipForm({
  imageLimit,
  defaultFaith,
  defaultCountry,
}: {
  imageLimit: number;
  defaultFaith: Faith;
  defaultCountry: string;
}) {
  const [state, formAction] = useFormState(submitWorshipAction, emptyState);
  const [images, setImages] = useState<string[]>([]);

  return (
    <form action={formAction} className="space-y-4">
      <FormError>{state.error}</FormError>
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Type of place">
          <select name="faith" defaultValue={defaultFaith} className={inputClass}>
            {FAITHS.map((faith) => (
              <option key={faith} value={faith}>
                {FAITH_LABELS[faith]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Name" hint="e.g. Shree Siddhivinayak Temple">
          <input name="name" required className={inputClass} />
        </Field>
        <Field label="Street address">
          <input name="address" className={inputClass} />
        </Field>
        <Field label="City">
          <input name="city" required className={inputClass} />
        </Field>
        <Field label="State / province">
          <input name="state" className={inputClass} />
        </Field>
        <Field label="Country">
          <input name="country" defaultValue={defaultCountry} required className={inputClass} />
        </Field>
        <Field label="WhatsApp number" hint="Shown as a “Contact / join” button">
          <input name="whatsapp" className={inputClass} />
        </Field>
        <Field label="Phone">
          <input name="phone" className={inputClass} />
        </Field>
        <Field label="Website">
          <input name="websiteUrl" type="url" placeholder="https://" className={inputClass} />
        </Field>
      </div>

      <Field label="About" hint="Timings, aarti/namaz/mass schedule, langar, facilities">
        <textarea name="description" rows={4} className={inputClass} />
        <WriteHelper
          kind="worship"
          target="description"
          fields={{ name: "Name", faith: "Faith", city: "City" }}
        />
      </Field>

      <Field label="Photos" hint={`Drag & drop up to ${imageLimit} photos.`}>
        <div className="space-y-3">
          {images.length ? (
            <div className="flex flex-wrap gap-2">
              {images.map((url) => (
                <div key={url} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className="h-20 w-28 rounded-xl border border-slate-200 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((item) => item !== url))}
                    className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white"
                    aria-label="Remove photo"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          {images.length < imageLimit ? (
            <ImageDropzone
              purpose="listing"
              multiple
              onUploaded={(url) => setImages((current) => [...current, url].slice(0, imageLimit))}
            />
          ) : (
            <p className="text-xs text-slate-500">
              You have reached your plan&apos;s {imageLimit} photo limit.
            </p>
          )}
          {images.map((url) => (
            <input key={url} type="hidden" name="images" value={url} />
          ))}
        </div>
      </Field>

      <SubmitButton pendingLabel="Submitting...">Submit for review</SubmitButton>
    </form>
  );
}
