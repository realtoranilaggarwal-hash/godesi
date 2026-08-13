"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { createListingAction } from "@/app/actions/listings";
import { emptyState } from "@/lib/actions";
import { Field, inputClass } from "@/components/ui";
import { CurrencySelect } from "@/components/forms/CurrencySelect";
import { SubmitButton } from "@/components/SubmitButton";
import { WriteHelper } from "@/components/WriteHelper";
import { ImageDropzone } from "@/components/ImageDropzone";
import { PhotoAlbumField } from "@/components/forms/PhotoAlbumField";
import { PropertyFields } from "@/components/forms/PropertyFields";
import {
  FairHousingNotice,
  RoomSharingNotice,
} from "@/components/FairHousingNotice";
import { FURNISHING_LABELS, GENDER_LABELS, KIND_LABELS } from "@/lib/listings";
import type { ListingKind, PropertyGroup } from "@prisma/client";
import { FormError } from "@/components/forms/FormError";
import { WEBSITE_OFFER } from "@/lib/websiteOffer";
import { PhoneInput } from "@/components/forms/PhoneInput";
import { DIAL_CODE_HINT } from "@/lib/dialCodes";

/** Grouped so nobody picks "for sale" expecting to sell a necklace. */
const KIND_GROUPS: { label: string; kinds: ListingKind[] }[] = [
  { label: "Homes & rooms", kinds: ["PROPERTY_SALE", "PROPERTY_RENT", "ROOM_OFFERED", "ROOM_WANTED"] },
  { label: "Buy & sell", kinds: ["MARKETPLACE"] },
];

export function ListingForm({
  defaultKind,
  imageLimit,
  defaultWhatsapp,
  defaultCurrency,
  categories,
  defaultGroup,
  defaultCountry,
}: {
  defaultKind: ListingKind;
  imageLimit: number;
  defaultWhatsapp: string;
  defaultCurrency: string;
  categories: { slug: string; name: string }[];
  /** Preselected property branch when arriving from the real-estate flow. */
  defaultGroup?: PropertyGroup;
  defaultCountry?: string;
}) {
  const [state, formAction] = useFormState(createListingAction, emptyState);
  const [kind, setKind] = useState<ListingKind>(defaultKind);
  const [images, setImages] = useState<string[]>([]);

  const isRoom = kind === "ROOM_OFFERED" || kind === "ROOM_WANTED";
  const isProperty = kind === "PROPERTY_SALE" || kind === "PROPERTY_RENT";
  const isItem = kind === "MARKETPLACE";
  const monthly = isRoom || kind === "PROPERTY_RENT";

  return (
    <form action={formAction} className="space-y-4">
      <FormError>{state.error}</FormError>

      <Field label="What are you listing?">
        <select
          name="kind"
          value={kind}
          onChange={(event) => setKind(event.target.value as ListingKind)}
          className={inputClass}
        >
          {KIND_GROUPS.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.kinds.map((option) => (
                <option key={option} value={option}>
                  {KIND_LABELS[option]}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </Field>

      {isItem ? (
        <Field
          label="Category"
          hint="Buyers browse by category, so pick the closest one."
          required
        >
          <select name="categorySlug" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Choose a category
            </option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      <Field
        label="Title"
        hint={
          isItem
            ? "e.g. 22ct gold jhumka earrings, worn once"
            : "e.g. 2 BHK in Kothrud, close to metro"
        }
      >
        <input name="title" required minLength={6} className={inputClass} />
      </Field>
      <Field
        label="Description"
        hint={
          isItem
            ? "Condition, size, age, what's included, why you are selling"
            : "Amenities, house rules, what's included"
        }
      >
        <textarea name="description" rows={5} required className={inputClass} />
        <WriteHelper
          kind="listing"
          target="description"
          fields={{
            kind: "Listing type",
            title: "Title",
            city: "City",
            area: "Area",
            price: "Price",
          }}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="City">
          <input name="city" required className={inputClass} />
        </Field>
        <Field label={isItem ? "Area (optional)" : "Area / locality"}>
          <input name="area" className={inputClass} />
        </Field>
        <Field
          label={monthly ? "Rent per month" : "Price"}
          hint="Leave 0 for price on request"
        >
          <input
            name="price"
            type="number"
            min={0}
            defaultValue={0}
            className={inputClass}
          />
        </Field>
        <CurrencySelect defaultValue={defaultCurrency} />
        <Field
          label="Video link (YouTube or Vimeo)"
          hint={`Optional ${isItem ? "clip of the item" : "walkthrough"} — paste a link like https://youtu.be/abc123.`}
        >
          <input
            name="videoUrl"
            placeholder="https://www.youtube.com/watch?v=..."
            className={inputClass}
          />
        </Field>
        <Field
          label="WhatsApp number"
          hint={`Buyers message you directly here. ${DIAL_CODE_HINT}`}
          required
        >
          <PhoneInput name="whatsapp" required defaultValue={defaultWhatsapp} />
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
            <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
              That is all {imageLimit} uploads on your plan.{" "}
              <a href="/upgrade" target="_blank" className="font-bold underline">
                Upgrade for 20 uploads
              </a>{" "}
              — or add a free Google Photos album below and show as many photos as you like.
            </p>
          )}
          {images.map((url) => (
            <input key={url} type="hidden" name="images" value={url} />
          ))}
        </div>
      </Field>

      {isProperty ? (
        <PropertyFields
          forRent={kind === "PROPERTY_RENT"}
          defaultGroup={defaultGroup}
          defaultCountry={defaultCountry}
        />
      ) : null}

      <PhotoAlbumField />

      {isProperty || isRoom ? <FairHousingNotice /> : null}
      {isRoom ? <RoomSharingNotice /> : null}

      <p className="rounded-xl bg-indigo-50 p-3 text-xs text-indigo-900">
        <strong>Selling or renting regularly?</strong> Godesi builds you a{" "}
        {WEBSITE_OFFER.pages}-page website for ${WEBSITE_OFFER.priceUsd}, then $
        {WEBSITE_OFFER.monthlyUsd}/month with domain and hosting included.{" "}
        <a href="/website" target="_blank" className="font-bold underline">
          See what you get →
        </a>
      </p>

      <SubmitButton pendingLabel="Publishing...">Publish listing</SubmitButton>
    </form>
  );
}
