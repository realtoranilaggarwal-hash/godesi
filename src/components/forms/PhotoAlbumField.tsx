"use client";

import { useState } from "react";
import { Field, inputClass } from "@/components/ui";

const STEPS = [
  "Open photos.google.com on your phone or computer and sign in.",
  "Tap Collections → Albums → Create album, give it a name like “My jewellery”.",
  "Tap Select photos and add every picture you want to show — there is no limit.",
  "Open the album, tap Share (↗) → Create link, then Copy.",
  "Paste that link in the box above and save. Keep the album shared — if you turn the link off, the gallery goes blank.",
];

/**
 * Godesi hosts one uploaded picture per business card, but sellers have dozens.
 * A public Google Photos album link renders as a gallery here at no storage
 * cost, and the photos stay in the seller's own account.
 */
export function PhotoAlbumField({
  defaultValue = "",
  hint,
}: {
  defaultValue?: string;
  hint?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Field
      label="Photo album link (Google Photos)"
      hint={
        hint ??
        "Show all your photos without uploading them — paste a public Google Photos album link and Godesi displays a 3×3 gallery that opens the album."
      }
    >
      <input
        name="albumUrl"
        type="url"
        inputMode="url"
        defaultValue={defaultValue}
        placeholder="https://photos.app.goo.gl/..."
        className={inputClass}
      />
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="mt-2 text-xs font-semibold text-indigo-700 underline"
      >
        {open ? "Hide the steps" : "How do I get this link? (5 steps)"}
      </button>
      {open ? (
        <ol className="mt-2 list-decimal space-y-1 rounded-xl bg-indigo-50 p-3 pl-7 text-xs text-indigo-900">
          {STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      ) : null}
    </Field>
  );
}
