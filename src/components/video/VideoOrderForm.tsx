"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { startVideoOrderAction } from "@/app/actions/videoOrders";
import { emptyState } from "@/lib/actions";
import { Button, Field, inputClass } from "@/components/ui";
import { FormError } from "@/components/forms/FormError";
import { ImageField } from "@/components/forms/ImageField";
import { VIDEO_LANGUAGES, VIDEO_OFFER, wordCount } from "@/lib/videoOffer";

function PayButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full py-3 text-base sm:w-auto">
      {pending ? "Opening checkout…" : `🎬 Pay $${VIDEO_OFFER.priceUsd} and order my video`}
    </Button>
  );
}

/** The $50 AI video order: business, script (80 words), on-screen contact, language, logo, delivery WhatsApp. */
export function VideoOrderForm({
  defaults,
}: {
  defaults?: { businessName?: string; contactPhone?: string; websiteUrl?: string };
}) {
  const [state, formAction] = useFormState(startVideoOrderAction, emptyState);
  const [script, setScript] = useState("");
  const words = wordCount(script);
  const over = words > VIDEO_OFFER.maxWords;

  return (
    <form action={formAction} className="space-y-4">
      <FormError>{state.error}</FormError>

      <Field label="Business name" required>
        <input
          name="businessName"
          required
          maxLength={VIDEO_OFFER.businessNameMax}
          defaultValue={defaults?.businessName?.slice(0, VIDEO_OFFER.businessNameMax)}
          className={inputClass}
        />
      </Field>

      <Field
        label="What should she say?"
        required
        hint="Write it like she's talking to a friend — start with 'Did you know?'"
      >
        <textarea
          name="script"
          required
          rows={5}
          value={script}
          onChange={(event) => setScript(event.target.value)}
          placeholder="Did you know? …"
          className={inputClass}
        />
      </Field>
      <p
        className={`-mt-2 text-right text-xs font-semibold ${over ? "text-rose-600" : "text-slate-500"}`}
        aria-live="polite"
      >
        {words} / {VIDEO_OFFER.maxWords} words{over ? " — please shorten it" : ""}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Phone / WhatsApp to show in the video" required>
          <input
            name="contactPhone"
            type="tel"
            required
            defaultValue={defaults?.contactPhone}
            className={inputClass}
          />
        </Field>
        <Field label="Website or GoDesi link" hint="e.g. godesi.com/yourname">
          <input
            name="websiteUrl"
            inputMode="url"
            defaultValue={defaults?.websiteUrl}
            className={inputClass}
          />
        </Field>
        <Field label="Language" required>
          <select name="language" required defaultValue="English" className={inputClass}>
            {VIDEO_LANGUAGES.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Your WhatsApp number"
          required
          hint="We WhatsApp the finished video here."
        >
          <input name="deliveryWhatsapp" type="tel" required className={inputClass} />
        </Field>
      </div>

      <ImageField
        name="logoUrl"
        label="Logo or photo (optional)"
        purpose="video"
        hint="1 image, up to 5 MB."
      />

      <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-3 text-sm font-semibold text-indigo-900">
        ${VIDEO_OFFER.priceUsd} — one video, one revision included
      </div>

      <PayButton />
    </form>
  );
}
