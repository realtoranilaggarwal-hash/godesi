"use client";

import { useState } from "react";
import { Field, inputClass } from "@/components/ui";
import { ImageDropzone, type UploadPurpose } from "@/components/ImageDropzone";

/**
 * Form field backed by an uploaded image: drag & drop writes the blob URL into
 * a hidden input, and pasting a URL still works for people with hosted images.
 */
export function ImageField({
  name,
  label,
  purpose,
  defaultValue = "",
  hint,
  previewClassName = "h-24 w-24 rounded-xl object-cover",
}: {
  name: string;
  label: string;
  purpose: UploadPurpose;
  defaultValue?: string;
  hint?: string;
  previewClassName?: string;
}) {
  const [url, setUrl] = useState(defaultValue);

  return (
    <div className="space-y-2">
      <Field label={label} hint={hint}>
        <div className="space-y-2">
          {url ? (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className={`border border-slate-200 ${previewClassName}`}
              />
              <button
                type="button"
                onClick={() => setUrl("")}
                className="text-xs font-semibold text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          ) : null}
          <ImageDropzone purpose={purpose} onUploaded={setUrl} />
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="…or paste an image URL"
            className={inputClass}
          />
        </div>
      </Field>
      <input type="hidden" name={name} value={url} />
    </div>
  );
}
