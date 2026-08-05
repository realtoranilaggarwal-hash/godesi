"use client";

import { useFormState } from "react-dom";
import type { Business } from "@prisma/client";
import { saveBusinessProfileAction } from "@/app/actions/business";
import { emptyState } from "@/lib/actions";
import { Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { CategorySelect, type CategoryOption } from "@/components/forms/CategorySelect";
import { ImageField } from "@/components/forms/ImageField";
import { PhotoAlbumField } from "@/components/forms/PhotoAlbumField";
import { WriteHelper } from "@/components/WriteHelper";
import { BUSINESS_SOCIALS } from "@/lib/businessSocials";
import { SpecialtyPicker } from "@/components/forms/SpecialtyPicker";
import { specialtySet } from "@/lib/specialties";
import { VehicleFields, type VehicleDefaults } from "@/components/forms/VehicleFields";
import { useState } from "react";
import { COUNTRIES } from "@/lib/countries";
import { FormError } from "@/components/forms/FormError";
import { WEBSITE_OFFER } from "@/lib/websiteOffer";
import { PhoneInput } from "@/components/forms/PhoneInput";
import { DIAL_CODE_HINT } from "@/lib/dialCodes";

const EMPTY_VEHICLE: VehicleDefaults = {
  vehicleType: "",
  make: "",
  model: "",
  year: "",
  mileage: "",
  mileageUnit: "mi",
  fuelType: "",
  transmission: "",
  ownership: "",
  condition: "",
  price: "",
  currency: "USD",
  negotiable: false,
  features: [],
  documents: [],
};

/** Individual sellers in Buy & Sell only need these — the rest is business clutter. */
const PERSONAL_SOCIALS = ["websiteUrl", "instagramUrl", "facebookUrl"];

export function BusinessProfileForm({
  business,
  vehicle,
  categories,
  defaultCategory,
  defaultSubcategory,
  defaultProfileType = "BUSINESS",
  defaultCountry = "",
  canFeatureSpecialty = false,
  extraCategoryLimit = 0,
  foundingMember = false,
  staffEdit = false,
}: {
  business: Business | null;
  /** Saved Cars & Bikes details, when the card already has them. */
  vehicle?: VehicleDefaults;
  categories: CategoryOption[];
  /** Paid plans may highlight one specialisation as a badge. */
  canFeatureSpecialty?: boolean;
  /** Pre-selected when arriving from a category page or the guided posting flow. */
  defaultCategory?: string;
  defaultSubcategory?: string;
  defaultProfileType?: string;
  /** Guessed from the visitor's country so the field starts filled in. */
  defaultCountry?: string;
  /** Extra categories the member's plan (or founding seat) allows. */
  extraCategoryLimit?: number;
  foundingMember?: boolean;
  /** Staff editing somebody else's card: posts the id and skips plan limits. */
  staffEdit?: boolean;
}) {
  const [state, formAction] = useFormState(saveBusinessProfileAction, emptyState);
  const [subcategory, setSubcategory] = useState(
    business?.subcategorySlug ?? defaultSubcategory ?? "",
  );
  const [category, setCategory] = useState(
    business?.categorySlug ?? defaultCategory ?? "",
  );
  const [profileType, setProfileType] = useState(
    business?.profileType ?? defaultProfileType,
  );
  /** A private seller does not need 16 social buttons on a used-car ad. */
  const personalSeller = category === "buy-sell" && profileType === "PROFESSIONAL";
  const socials = personalSeller
    ? BUSINESS_SOCIALS.filter((social) => PERSONAL_SOCIALS.includes(social.key))
    : BUSINESS_SOCIALS;
  /** Saved certifications split back into checkbox values and free-text extras. */
  const offered = specialtySet(subcategory)?.certifications?.options ?? [];
  const saved = business?.certifications ?? [];
  const knownCertifications = saved.filter((item) => offered.includes(item));
  const otherCertifications = saved
    .filter((item) => !offered.includes(item))
    .join(", ");

  return (
    <form action={formAction} className="space-y-4">
      <FormError>{state.error}</FormError>
      {staffEdit && business ? (
        <>
          <input type="hidden" name="businessId" value={business.id} />
          <p className="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-900">
            Staff edit — you are changing “{business.name}” on behalf of its
            owner.
          </p>
        </>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="This card is for">
          <select
            name="profileType"
            value={profileType}
            onChange={(event) => setProfileType(event.target.value)}
            className={inputClass}
          >
            <option value="BUSINESS">A business / shop</option>
            <option value="PROFESSIONAL">An individual professional</option>
          </select>
        </Field>
        <Field label="Business or professional name" required>
          <input name="name" required defaultValue={business?.name ?? ""} className={inputClass} />
        </Field>
        <CategorySelect
          categories={categories}
          defaultCategory={business?.categorySlug ?? defaultCategory}
          defaultSubcategory={business?.subcategorySlug ?? defaultSubcategory}
          onSubcategoryChange={setSubcategory}
          onCategoryChange={setCategory}
          extraLimit={extraCategoryLimit}
          defaultExtras={business?.extraCategorySlugs ?? []}
          foundingMember={foundingMember}
        />
        <Field
          label="City"
          hint="Work online or serve many areas? Type “Online”, “Anywhere” or your main base."
          required
        >
          <input name="city" required defaultValue={business?.city ?? ""} className={inputClass} />
        </Field>
        <Field label="State">
          <input name="state" defaultValue={business?.state ?? ""} className={inputClass} />
        </Field>
        <Field label="Country" required>
          <input
            name="country"
            list="godesi-countries"
            required
            defaultValue={business?.country ?? defaultCountry}
            placeholder="Start typing…"
            className={inputClass}
          />
          <datalist id="godesi-countries">
            {COUNTRIES.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </Field>
      </div>

      <SpecialtyPicker
        key={subcategory}
        subcategorySlug={subcategory}
        defaults={{
          specialties: business?.specialties ?? [],
          featuredSpecialty: business?.featuredSpecialty ?? null,
          certifications: knownCertifications,
          certificationsOther: otherCertifications,
          licenseNumber: business?.licenseNumber ?? "",
          feeStructure: business?.feeStructure ?? "",
          carriers: business?.carriers ?? "",
          yearsExperience:
            business?.yearsExperience === null || business?.yearsExperience === undefined
              ? ""
              : String(business.yearsExperience),
          serviceOptions: business?.serviceOptions ?? [],
          priceFrom: business?.priceFrom ?? "",
          priceHourly: business?.priceHourly ?? "",
          priceExtra: business?.priceExtra ?? "",
          availability: business?.availability ?? "",
          licenseDocUrl: business?.licenseDocUrl ?? "",
        }}
        canFeature={canFeatureSpecialty}
        cardSaved={Boolean(business)}
      />

      <VehicleFields
        key={`vehicle-${subcategory}`}
        subcategorySlug={subcategory}
        defaults={vehicle ?? EMPTY_VEHICLE}
      />

      <Field label="About your business">
        <textarea
          name="description"
          rows={4}
          defaultValue={business?.description ?? ""}
          className={inputClass}
        />
        <WriteHelper
          kind="business"
          target="description"
          fields={{
            name: "Business name",
            city: "City",
            state: "State",
            category: "Category",
            subcategory: "Service",
          }}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="WhatsApp number" hint={DIAL_CODE_HINT} required>
          <PhoneInput
            name="whatsappNumber"
            required
            defaultValue={business?.whatsappNumber ?? ""}
          />
        </Field>
        <Field label="Phone" hint={DIAL_CODE_HINT}>
          <PhoneInput name="phone" defaultValue={business?.phone ?? ""} />
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
        <PhotoAlbumField
          defaultValue={business?.albumUrl ?? ""}
          hint="Your card holds one picture. Paste a public Google Photos album link and Godesi shows a 3×3 gallery of your work that opens the full album — no upload limit, no storage cost."
        />
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
        <Field label="Address">
          <input name="address" defaultValue={business?.address ?? ""} className={inputClass} />
        </Field>
      </div>


      <details className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4" open>
        <summary className="cursor-pointer text-sm font-bold text-slate-900">
          Social &amp; profile links
        </summary>
        <p className="mt-1 text-xs text-slate-500">
          {personalSeller
            ? "Optional — add a profile so buyers can see who they are dealing with."
            : "Add every profile you have — each one appears as a button on your public card. Leave the rest blank."}
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {socials.map((social) => (
            <Field key={social.key} label={`${social.icon} ${social.label}`}>
              <input
                name={social.key}
                type="url"
                defaultValue={business?.[social.key] ?? ""}
                placeholder={social.placeholder}
                className={inputClass}
              />
            </Field>
          ))}
        </div>
        <p className="mt-3 rounded-xl bg-indigo-50 p-3 text-xs text-indigo-900">
          <strong>No website yet?</strong> Godesi builds you a {WEBSITE_OFFER.pages}-page
          mobile-friendly site for ${WEBSITE_OFFER.priceUsd}, then ${WEBSITE_OFFER.monthlyUsd}
          /month with domain and hosting included.{" "}
          <a
            href="/website"
            target="_blank"
            className="font-bold underline"
          >
            See what you get and send your details →
          </a>
        </p>
      </details>

      <SubmitButton>{business ? "Save changes" : "Create my card"}</SubmitButton>
    </form>
  );
}
