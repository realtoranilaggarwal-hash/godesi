"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { createListingAction } from "@/app/actions/listings";
import { emptyState } from "@/lib/actions";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { ImageDropzone } from "@/components/ImageDropzone";
import { FURNISHING_LABELS, GENDER_LABELS, KIND_LABELS } from "@/lib/listings";
import type { ListingKind } from "@prisma/client";

const KINDS: ListingKind[] = [
  "PROPERTY_SALE",
  "PROPERTY_RENT",
  "ROOM_OFFERED",
  "ROOM_WANTED",
  "MARKETPLACE",
];

export function ListingForm({
  defaultKind,
  imageLimit,
  defaultWhatsapp,
}: {
  defaultKind: ListingKind;
  imageLimit: number;
  defaultWhatsapp: string;
}) {
  const [state, formAction] = useFormState(createListingAction, emptyState);
  const [kind, setKind] = useState<ListingKind>(defaultKind);
  const [images, setImages] = useState<string[]>([]);

  const isRoom = kind === "ROOM_OFFERED" || kind === "ROOM_WANTED";
  const isProperty = kind === "PROPERTY_SALE" || kind === "PROPERTY_RENT";
  const monthly = isRoom || kind === "PROPERTY_RENT";

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? <Alert>{state.error}</Alert> : null}

      <Field label="What are you listing?">
        <select
          name="kind"
          value={kind}
          onChange={(event) => setKind(event.target.value as ListingKind)}
          className={inputClass}
        >
          {KINDS.map((option) => (
            <option key={option} value={option}>
              {KIND_LABELS[option]}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Title" hint="e.g. 2 BHK in Kothrud, close to metro">
        <input name="title" required minLength={6} className={inputClass} />
      </Field>
      <Field label="Description" hint="Amenities, house rules, what's included">
        <textarea name="description" rows={5} required className={inputClass} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="City">
          <input name="city" required className={inputClass} />
        </Field>
        <Field label="Area / locality">
          <input name="area" className={inputClass} />
        </Field>
        <Field
          label={monthly ? "Rent per month (₹)" : "Price (₹)"}
          hint="Leave 0 for price on request"
        >
          <input
            name="priceInr"
            type="number"
            min={0}
            defaultValue={0}
            className={inputClass}
          />
        </Field>
        <Field label="WhatsApp number" hint="Buyers message you directly here">
          <input
            name="whatsapp"
            required
            defaultValue={defaultWhatsapp}
            className={inputClass}
          />
        </Field>

        {isProperty ? (
          <Field label="Bedrooms (BHK)">
            <input name="bedrooms" type="number" min={0} max={20} className={inputClass} />
          </Field>
        ) : null}

        {isRoom || isProperty ? (
          <Field label="Furnishing">
            <select name="furnishing" className={inputClass}>
              <option value="">Not specified</option>
              {Object.entries(FURNISHING_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        ) : null}

        {isRoom ? (
          <Field label="Preferred flatmate">
            <select name="genderPref" defaultValue="ANY" className={inputClass}>
              {Object.entries(GENDER_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        ) : null}
      </div>

      <Field
        label="Photos"
        hint={`Drag & drop up to ${imageLimit} photos — they are resized automatically.`}
      >
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

      <SubmitButton pendingLabel="Publishing...">Publish listing</SubmitButton>
    </form>
  );
}
