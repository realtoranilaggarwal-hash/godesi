"use client";

import { useFormState } from "react-dom";
import type { Business } from "@prisma/client";
import { saveBusinessProfileAction } from "@/app/actions/business";
import { emptyState } from "@/lib/actions";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { CategorySelect, type CategoryOption } from "@/components/forms/CategorySelect";

export function BusinessProfileForm({
  business,
  categories,
}: {
  business: Business | null;
  categories: CategoryOption[];
}) {
  const [state, formAction] = useFormState(saveBusinessProfileAction, emptyState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? <Alert>{state.error}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Business name">
          <input name="name" required defaultValue={business?.name ?? ""} className={inputClass} />
        </Field>
        <CategorySelect
          categories={categories}
          defaultCategory={business?.categorySlug}
          defaultSubcategory={business?.subcategorySlug}
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
        <Field label="Logo URL">
          <input name="logoUrl" defaultValue={business?.logoUrl ?? ""} className={inputClass} />
        </Field>
        <Field label="Website">
          <input
            name="websiteUrl"
            defaultValue={business?.websiteUrl ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Google Maps link">
          <input name="mapsUrl" defaultValue={business?.mapsUrl ?? ""} className={inputClass} />
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
