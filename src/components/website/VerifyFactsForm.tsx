"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { verifyFactsAction } from "@/app/actions/websiteBuilder";
import { emptyState } from "@/lib/actions";
import { Field, inputClass } from "@/components/ui";
import { FormError } from "@/components/forms/FormError";
import { SubmitButton } from "@/components/SubmitButton";
import { PhoneInput } from "@/components/forms/PhoneInput";
import type { FoundFacts } from "@/lib/websiteBuilder";

/** Screen 2: "is this right?" — what we read, editable, photos tickable. */
export function VerifyFactsForm({
  id,
  project,
  found,
}: {
  id: string;
  project: {
    businessName: string;
    phone: string | null;
    email: string | null;
    whatsapp: string | null;
    address: string | null;
  };
  found: FoundFacts | null;
}) {
  const [state, formAction] = useFormState(verifyFactsAction.bind(null, id), emptyState);
  const [dropped, setDropped] = useState<string[]>([]);
  const photos = found?.photos ?? [];

  return (
    <form action={formAction} className="space-y-5">
      <FormError>{state.error}</FormError>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Business name" required>
          <input
            name="businessName"
            required
            maxLength={120}
            defaultValue={project.businessName}
            className={inputClass}
          />
        </Field>
        <Field label="Phone">
          <PhoneInput name="phone" defaultValue={project.phone ?? ""} fallbackCode="+1" />
        </Field>
        <Field label="Email">
          <input name="email" type="email" maxLength={160} defaultValue={project.email ?? ""} className={inputClass} />
        </Field>
        <Field label="WhatsApp">
          <PhoneInput name="whatsapp" defaultValue={project.whatsapp ?? ""} fallbackCode="+1" />
        </Field>
        <Field label="Address" className="sm:col-span-2">
          <input name="address" maxLength={240} defaultValue={project.address ?? ""} className={inputClass} />
        </Field>
        <Field
          label="About the business"
          hint="One or two lines is plenty — AI writes the rest."
          className="sm:col-span-2"
        >
          <textarea
            name="description"
            rows={3}
            maxLength={700}
            defaultValue={found?.description ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      {found?.hours?.length ? (
        <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <span className="font-semibold">Hours we found:</span> {found.hours.join(" · ")}
        </div>
      ) : null}
      {found?.rating ? (
        <div className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
          ⭐ {found.rating.toFixed(1)}
          {found.reviewCount ? ` from ${found.reviewCount} reviews` : ""} — shown on your site.
        </div>
      ) : null}
      {found?.services?.length ? (
        <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <span className="font-semibold">Services:</span> {found.services.slice(0, 12).join(", ")}
        </div>
      ) : null}

      {photos.length ? (
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">
            Photos we found — untick any you don&apos;t want on the site
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {photos.map((photo) => {
              const off = dropped.includes(photo);
              return (
                <button
                  key={photo}
                  type="button"
                  onClick={() =>
                    setDropped((current) =>
                      off ? current.filter((item) => item !== photo) : [...current, photo],
                    )
                  }
                  className={`relative aspect-square overflow-hidden rounded-xl border-2 ${
                    off ? "border-slate-200 opacity-40" : "border-indigo-500"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt="" className="h-full w-full object-cover" />
                  <span className="absolute left-1 top-1 rounded bg-white/90 px-1 text-xs">
                    {off ? "☐" : "☑"}
                  </span>
                </button>
              );
            })}
          </div>
          {photos
            .filter((photo) => !dropped.includes(photo))
            .map((photo) => <input key={photo} type="hidden" name="keepPhotos" value={photo} />)}
        </div>
      ) : (
        <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
          We didn&apos;t find photos on the pages you linked — you can add some on the next
          screen, or let AI use a clean design without them.
        </p>
      )}

      <div className="flex justify-end">
        <SubmitButton pendingLabel="Saving…" className="py-3 text-base">
          Yes, that&apos;s right →
        </SubmitButton>
      </div>
    </form>
  );
}
