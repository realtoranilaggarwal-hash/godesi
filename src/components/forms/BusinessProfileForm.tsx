"use client";

import { useFormState } from "react-dom";
import type { Business } from "@prisma/client";
import { saveBusinessProfileAction } from "@/app/actions/business";
import { emptyState } from "@/lib/actions";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { CategorySelect, type CategoryOption } from "@/components/forms/CategorySelect";
import { ImageField } from "@/components/forms/ImageField";

export function BusinessProfileForm({
  business,
  categories,
  defaultCategory,
  defaultSubcategory,
  defaultProfileType = "BUSINESS",
}: {
  business: Business | null;
  categories: CategoryOption[];
  /** Pre-selected when arriving from a category page or the guided posting flow. */
  defaultCategory?: string;
  defaultSubcategory?: string;
  defaultProfileType?: string;
}) {
  const [state, formAction] = useFormState(saveBusinessProfileAction, emptyState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? <Alert>{state.error}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="This card is for">
          <select
            name="profileType"
            defaultValue={business?.profileType ?? defaultProfileType}
            className={inputClass}
          >
            <option value="BUSINESS">A business / shop</option>
            <option value="PROFESSIONAL">An individual professional</option>
          </select>
        </Field>
        <Field label="Business or professional name">
          <input name="name" required defaultValue={business?.name ?? ""} className={inputClass} />
        </Field>
        <CategorySelect
          categories={categories}
          defaultCategory={business?.categorySlug ?? defaultCategory}
          defaultSubcategory={business?.subcategorySlug ?? defaultSubcategory}
        />
        <Field label="City">
          <input name="city" required defaultValue={business?.city ?? ""} className={inputClass} />
        </Field>
        <Field label="State">
          <input name="state" defaultValue={business?.state ?? ""} className={inputClass} />
        </Field>
      </div>

      <Field label="About your business">
        <textarea
          name="description"
          rows={4}
          defaultValue={business?.description ?? ""}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="WhatsApp number" hint="10-digit mobile or full number with country code">
          <input
            name="whatsappNumber"
            required
            defaultValue={business?.whatsappNumber ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Phone">
          <input name="phone" defaultValue={business?.phone ?? ""} className={inputClass} />
        </Field>
        <Field label="Public email">
          <input
            name="publicEmail"
            type="email"
            defaultValue={business?.publicEmail ?? ""}
            className={inputClass}
          />
        </Field>
        <ImageField
          name="logoUrl"
          label="Logo"
          purpose="logo"
          defaultValue={business?.logoUrl ?? ""}
          hint="Square logos look best."
        />
        <Field label="Website">
          <input
            name="websiteUrl"
            defaultValue={business?.websiteUrl ?? ""}
            className={inputClass}
          />
        </Field>
        <Field
          label="Video link (YouTube or Vimeo)"
          hint="Paste a link like https://youtu.be/abc123 or https://vimeo.com/123456 — it plays on your page."
        >
          <input
            name="videoUrl"
            defaultValue={business?.videoUrl ?? ""}
            placeholder="https://www.youtube.com/watch?v=..."
            className={inputClass}
          />
        </Field>
        <Field label="Google Maps link">
          <input name="mapsUrl" defaultValue={business?.mapsUrl ?? ""} className={inputClass} />
        </Field>
        <Field
          label="Starting price"
          hint="Shown as “From …” on marketplace cards. Leave blank to hide."
        >
          <div className="flex gap-2">
            <input
              name="startingPrice"
              type="number"
              min={0}
              defaultValue={business?.startingPrice ?? ""}
              className={inputClass}
            />
            <select
              name="priceCurrency"
              defaultValue={business?.priceCurrency ?? "USD"}
              aria-label="Price currency"
              className={inputClass}
            >
              <option value="USD">USD</option>
              <option value="INR">INR</option>
            </select>
          </div>
        </Field>
        <Field label="Custom quotes">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="customQuote"
              defaultChecked={business?.customQuote ?? false}
              className="h-4 w-4"
            />
            I price every job individually — invite enquiries for a quote
          </label>
        </Field>
        <Field label="Instagram">
          <input
            name="instagramUrl"
            defaultValue={business?.instagramUrl ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Facebook">
          <input
            name="facebookUrl"
            defaultValue={business?.facebookUrl ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="YouTube">
          <input
            name="youtubeUrl"
            defaultValue={business?.youtubeUrl ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Address">
          <input name="address" defaultValue={business?.address ?? ""} className={inputClass} />
        </Field>
      </div>

      <SubmitButton>{business ? "Save changes" : "Create my card"}</SubmitButton>
    </form>
  );
}
