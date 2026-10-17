"use client";

import { useState } from "react";
import { ImageDropzone } from "@/components/ImageDropzone";

/** Image URL box for an existing banner, with an upload that fills it in. */
export function BannerCreativeInput({
  defaultValue,
}: {
  defaultValue: string;
}) {
  const [url, setUrl] = useState(defaultValue);

  return (
    <>
      <input
        name="imageUrl"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        placeholder="image URL"
        className="w-56 rounded border border-slate-200 px-2 py-1 text-[11px]"
      />
      <details className="w-full">
        <summary className="cursor-pointer text-[11px] font-semibold text-indigo-600">
          upload a new image
        </summary>
        <div className="mt-1 max-w-sm">
          <ImageDropzone
            purpose="banner"
            label="Drop the new banner here, or click to choose"
            hint="Then press replace"
            onUploaded={setUrl}
          />
        </div>
      </details>
    </>
  );
}
