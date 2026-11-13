"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { startCustomWebsiteAction } from "@/app/actions/websiteBuilder";
import { emptyState } from "@/lib/actions";
import { Button, Field, inputClass } from "@/components/ui";
import { FormError } from "@/components/forms/FormError";
import {
  CUSTOM_PAGE_NAMES,
  CUSTOM_SOURCES,
  EXAMPLE_SITE_KEYS,
  WEBSITE_CATEGORIES,
} from "@/lib/websiteBuilder";

function SendButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full py-3 text-base sm:w-auto">
      {pending ? "Sending…" : "🎨 Send my custom website request"}
    </Button>
  );
}

/** The custom website order form: links, sites they like, and up to ten pages of words. */
export function CustomWebsiteForm({
  defaults,
}: {
  defaults?: { businessName?: string; city?: string; phone?: string; email?: string; website?: string; wish?: string };
}) {
  const [state, formAction] = useFormState(startCustomWebsiteAction, emptyState);
  const [shown, setShown] = useState(3);

  return (
    <form action={formAction} className="space-y-6">
      <FormError>{state.error}</FormError>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">1. About your business</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Business name" required>
            <input name="businessName" required defaultValue={defaults?.businessName} className={inputClass} />
          </Field>
          <Field label="Category" required>
            <select name="category" required defaultValue="" className={inputClass}>
              <option value="" disabled>Pick one…</option>
              {WEBSITE_CATEGORIES.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </Field>
          <Field label="City" required>
            <input name="city" required defaultValue={defaults?.city} className={inputClass} />
          </Field>
          <Field label="Email" required hint="We send your private design link here.">
            <input name="email" type="email" required defaultValue={defaults?.email} className={inputClass} />
          </Field>
          <Field label="Phone">
            <input name="phone" type="tel" defaultValue={defaults?.phone} className={inputClass} />
          </Field>
          <Field label="WhatsApp">
            <input name="whatsapp" type="tel" className={inputClass} />
          </Field>
          <Field label="Your domain, if you have one" hint="e.g. mybusiness.com — or leave blank and we register one.">
            <input name="domain" className={inputClass} />
          </Field>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">2. Where you are online now</h2>
        <p className="text-sm text-slate-600">
          Paste any links you have. We pull your photos, reviews, services and wording from them.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {CUSTOM_SOURCES.map((source) => (
            <Field key={source.key} label={source.label}>
              <input
                name={source.key}
                inputMode="url"
                placeholder={source.placeholder}
                defaultValue={source.key === "website" ? defaults?.website : undefined}
                className={inputClass}
              />
            </Field>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">3. Websites you like</h2>
        <p className="text-sm text-slate-600">Up to three sites whose look you want — any business, anywhere.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {EXAMPLE_SITE_KEYS.map((key, index) => (
            <Field key={key} label={`Example ${index + 1}`}>
              <input name={key} inputMode="url" placeholder="https://…" className={inputClass} />
            </Field>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">4. Your pages (up to {CUSTOM_PAGE_NAMES.length})</h2>
        <p className="text-sm text-slate-600">
          Type or paste what each page should say. Rename any page. Leave a page empty to skip it.
        </p>
        {CUSTOM_PAGE_NAMES.slice(0, shown).map((name, index) => (
          <div key={name} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
            <input
              name={`pageName${index}`}
              defaultValue={name}
              aria-label={`Page ${index + 1} name`}
              className={`${inputClass} font-semibold`}
            />
            <textarea
              name={`pageText${index}`}
              rows={4}
              maxLength={6000}
              placeholder={`What should the ${name} page say?`}
              aria-label={`Page ${index + 1} content`}
              className={`${inputClass} mt-2`}
            />
          </div>
        ))}
        {shown < CUSTOM_PAGE_NAMES.length ? (
          <button
            type="button"
            onClick={() => setShown((current) => Math.min(CUSTOM_PAGE_NAMES.length, current + 1))}
            className="text-sm font-semibold text-indigo-700 underline"
          >
            + Add another page ({CUSTOM_PAGE_NAMES.length - shown} left)
          </button>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">5. Anything else?</h2>
        <Field label="What do you want on your website, or changed from your old one?">
          <textarea
            name="wish"
            rows={3}
            maxLength={3000}
            defaultValue={defaults?.wish}
            placeholder='e.g. "Modern look, add online booking, show our Google reviews"'
            className={inputClass}
          />
        </Field>
      </section>

      <SendButton />
    </form>
  );
}
