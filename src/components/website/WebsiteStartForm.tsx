"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { startWebsiteAction } from "@/app/actions/websiteBuilder";
import { emptyState } from "@/lib/actions";
import { Button, Field, inputClass } from "@/components/ui";
import { FormError } from "@/components/forms/FormError";
import { PhoneInput } from "@/components/forms/PhoneInput";
import {
  WEBSITE_CATEGORIES,
  WEBSITE_SOURCES,
  type WebsiteSourceKey,
} from "@/lib/websiteBuilder";

function FindButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full py-3 text-base sm:w-auto">
      {pending ? "🔎 Reading your pages…" : "🚀 Build my website FREE"}
    </Button>
  );
}

/**
 * Screen 1: paste the links that already describe the business, plus the few
 * facts no page can tell us. Nothing here costs the owner anything.
 */
export function WebsiteStartForm({
  defaults,
}: {
  defaults?: { businessName?: string; city?: string; phone?: string; email?: string; website?: string };
}) {
  const [state, formAction] = useFormState(startWebsiteAction, emptyState);
  const [picked, setPicked] = useState<WebsiteSourceKey[]>(
    defaults?.website ? ["website"] : ["google"],
  );
  const [none, setNone] = useState(false);

  function toggle(key: WebsiteSourceKey) {
    setNone(false);
    setPicked((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <FormError>{state.error}</FormError>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">1. Find my business</h2>
        <p className="text-sm text-slate-600">
          Do you already have an online profile? Tick what you have and paste the link — AI
          reads your name, description, photos, hours and reviews from it.
        </p>
        <div className="flex flex-wrap gap-2">
          {WEBSITE_SOURCES.map((source) => {
            const on = picked.includes(source.key);
            return (
              <button
                key={source.key}
                type="button"
                onClick={() => toggle(source.key)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  on
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:border-indigo-400"
                }`}
              >
                {on ? "☑" : "☐"} {source.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setNone(true);
              setPicked([]);
            }}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              none
                ? "border-slate-800 bg-slate-800 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-slate-500"
            }`}
          >
            {none ? "☑" : "☐"} I don&apos;t have any
          </button>
        </div>

        {picked.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {WEBSITE_SOURCES.filter((source) => picked.includes(source.key)).map((source) => (
              <Field key={source.key} label={source.label}>
                <input
                  name={source.key}
                  type="url"
                  inputMode="url"
                  placeholder={source.placeholder}
                  defaultValue={source.key === "website" ? defaults?.website ?? "" : ""}
                  className={inputClass}
                />
              </Field>
            ))}
          </div>
        ) : none ? (
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
            No problem — AI will write the first version from what you type below, and you
            can add photos on the next screen.
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">2. Tell us about your business</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Business name" required>
            <input
              name="businessName"
              required
              maxLength={120}
              defaultValue={defaults?.businessName ?? ""}
              className={inputClass}
            />
          </Field>
          <Field label="Business category" required>
            <select name="category" required defaultValue="" className={inputClass}>
              <option value="" disabled>
                Choose…
              </option>
              {WEBSITE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </Field>
          <Field label="City / location" required>
            <input
              name="city"
              required
              maxLength={120}
              defaultValue={defaults?.city ?? ""}
              placeholder="Edison, NJ"
              className={inputClass}
            />
          </Field>
          <Field label="Phone" hint="Leave blank if it is on your Google or Yelp page.">
            <PhoneInput name="phone" defaultValue={defaults?.phone ?? ""} fallbackCode="+1" />
          </Field>
          <Field label="Email">
            <input
              name="email"
              type="email"
              maxLength={160}
              defaultValue={defaults?.email ?? ""}
              className={inputClass}
            />
          </Field>
          <Field label="WhatsApp" hint="Customers get a WhatsApp button on the site.">
            <PhoneInput name="whatsapp" fallbackCode="+1" />
          </Field>
          <Field label="Business address" className="sm:col-span-2">
            <input name="address" maxLength={240} className={inputClass} />
          </Field>
          <Field
            label="Domain you already own"
            hint="Optional — we can point it at the new site. Leave blank to get one included."
            className="sm:col-span-2"
          >
            <input name="domain" maxLength={120} placeholder="mybusiness.com" className={inputClass} />
          </Field>
        </div>
      </section>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          Free preview. No card needed. We only read pages you link to, and only for your
          website — nothing is published anywhere else.
        </p>
        <FindButton />
      </div>
    </form>
  );
}
