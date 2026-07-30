"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { submitEliteAction } from "@/app/actions/elite";
import { emptyState } from "@/lib/actions";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/forms/FormError";
import { ImageDropzone } from "@/components/ImageDropzone";
import { PhoneInput } from "@/components/forms/PhoneInput";
import { DIAL_CODE_HINT } from "@/lib/dialCodes";
import { INTERVIEW_TYPES, ELITE_CATEGORIES } from "@/lib/elite";

export function EliteForm({
  defaultName = "",
  defaultEmail = "",
  defaultBusiness = "",
  defaultCity = "",
  defaultCountry = "",
  profileUrl,
  initialNomination = "SELF",
}: {
  defaultName?: string;
  defaultEmail?: string;
  defaultBusiness?: string;
  defaultCity?: string;
  defaultCountry?: string;
  /** godesi.com/<username>, shown so applicants know what we link to. */
  profileUrl?: string | null;
  initialNomination?: "SELF" | "OTHER";
}) {
  const [state, formAction] = useFormState(submitEliteAction, emptyState);
  const [nomination, setNomination] = useState(initialNomination);
  const [photoUrl, setPhotoUrl] = useState("");
  const [proofUrls, setProofUrls] = useState<string[]>([]);
  const nominatingOther = nomination === "OTHER";

  if (state.success) {
    return <Alert tone="success">{state.success}</Alert>;
  }

  return (
    <form action={formAction} className="space-y-5">
      <FormError>{state.error}</FormError>

      <fieldset className="rounded-2xl border border-slate-200 p-4">
        <legend className="px-1 text-sm font-bold text-slate-900">
          Who is this application for?
        </legend>
        <div className="flex flex-wrap gap-4 text-sm">
          {(["SELF", "OTHER"] as const).map((value) => (
            <label key={value} className="flex items-center gap-2 font-semibold">
              <input
                type="radio"
                name="nominationType"
                value={value}
                checked={nomination === value}
                onChange={() => setNomination(value)}
              />
              {value === "SELF" ? "Myself" : "I'm nominating someone else"}
            </label>
          ))}
        </div>
        {nominatingOther ? (
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field label="Nominee's name" required>
              <input name="nomineeName" required className={inputClass} />
            </Field>
            <Field
              label="Nominee's email or WhatsApp"
              hint="We invite them to complete their profile."
            >
              <input name="nomineeContact" className={inputClass} />
            </Field>
          </div>
        ) : null}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={nominatingOther ? "Your name" : "Full name"} required>
          <input
            name="fullName"
            required
            defaultValue={defaultName}
            className={inputClass}
          />
        </Field>
        <Field label="Business / organisation">
          <input
            name="businessName"
            defaultValue={defaultBusiness}
            className={inputClass}
          />
        </Field>
        <Field label="Category" required>
          <select name="category" required defaultValue="" className={inputClass}>
            <option value="">Choose a category</option>
            {ELITE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </Field>
        <Field label="City" required>
          <input
            name="city"
            required
            defaultValue={defaultCity}
            className={inputClass}
          />
        </Field>
        <Field label="State / province">
          <input name="state" className={inputClass} />
        </Field>
        <Field label="Country">
          <input name="country" defaultValue={defaultCountry} className={inputClass} />
        </Field>
      </div>

      {profileUrl ? (
        <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
          Your Godesi profile <strong>{profileUrl}</strong> is linked from the
          GoDesi Elite entry.
        </p>
      ) : null}

      <Field
        label="Short bio"
        hint="Up to about 300 words — who you are and what you are known for."
        required
      >
        <textarea name="shortBio" rows={5} required className={inputClass} />
      </Field>
      <Field label="Achievements" hint="One per line — awards, milestones, press, service.">
        <textarea name="achievements" rows={4} className={inputClass} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Years of experience">
          <input
            name="yearsExperience"
            type="number"
            min={0}
            max={80}
            className={inputClass}
          />
        </Field>
        <Field label="Website">
          <input name="websiteUrl" type="url" className={inputClass} />
        </Field>
        <Field label="Video (YouTube / Vimeo)" hint="Shown on your published profile.">
          <input name="videoUrl" type="url" className={inputClass} />
        </Field>
      </div>

      <Field label="Social links" hint="Paste as many as you like, separated by spaces.">
        <textarea name="socialLinks" rows={2} className={inputClass} />
      </Field>

      <fieldset className="rounded-2xl border border-slate-200 p-4">
        <legend className="px-1 text-sm font-bold text-slate-900">
          Photo & proof (optional)
        </legend>
        <input type="hidden" name="photoUrl" value={photoUrl} />
        <ImageDropzone
          purpose="avatar"
          label="Upload your photo"
          onUploaded={(url) => setPhotoUrl(url)}
        />
        {photoUrl ? (
          <p className="mt-2 text-xs font-semibold text-emerald-700">Photo added ✓</p>
        ) : null}

        {proofUrls.map((url) => (
          <input key={url} type="hidden" name="proofUrls" value={url} />
        ))}
        <div className="mt-3">
          <ImageDropzone
            purpose="gallery"
            multiple
            label="Upload certificates, awards or press clippings"
            onUploaded={(url) => setProofUrls((current) => [...current, url])}
          />
          {proofUrls.length ? (
            <p className="mt-2 text-xs font-semibold text-emerald-700">
              {proofUrls.length} file(s) added ✓
            </p>
          ) : null}
        </div>
        <div className="mt-3">
          <Field label="Media links" hint="Articles, interviews or videos about you.">
            <textarea name="mediaLinks" rows={2} className={inputClass} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="rounded-2xl border border-slate-200 p-4">
        <legend className="px-1 text-sm font-bold text-slate-900">
          Interview preference
        </legend>
        <p className="mb-2 text-xs text-slate-500">
          Tick every format that works for you — our team picks one and contacts you.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {INTERVIEW_TYPES.map((type) => (
            <label key={type} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="interviewTypes" value={type} />
              {type}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Contact phone / WhatsApp" hint={DIAL_CODE_HINT}>
          <PhoneInput name="contactPhone" />
        </Field>
        <Field label="Contact email">
          <input
            name="contactEmail"
            type="email"
            defaultValue={defaultEmail}
            className={inputClass}
          />
        </Field>
      </div>

      <SubmitButton>
        {nominatingOther ? "Send nomination" : "Submit my application"}
      </SubmitButton>
      <p className="text-xs text-slate-500">
        Contact details are never shown on Basic entries — Premium and Featured
        profiles display them.
      </p>
    </form>
  );
}
