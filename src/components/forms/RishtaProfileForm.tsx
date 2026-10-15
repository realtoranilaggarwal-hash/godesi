"use client";

import Link from "next/link";
import type { RishtaProfile } from "@prisma/client";
import { useFormState } from "react-dom";
import { saveRishtaProfileAction } from "@/app/actions/rishta";
import { emptyState } from "@/lib/actions";
import { DIAL_CODE_HINT } from "@/lib/dialCodes";
import { NAKSHATRAS, RASHIS } from "@/lib/kundliSigns";
import {
  HEIGHTS_CM,
  POSTED_BY_LABELS,
  RELIGIONS,
  RISHTA_MARITAL_LABELS,
  heightLabel,
} from "@/lib/rishta";
import { SubmitButton } from "@/components/SubmitButton";
import { Field, inputClass } from "@/components/ui";
import { FormError } from "@/components/forms/FormError";
import { FormSuccess } from "@/components/forms/FormSuccess";
import { PhoneInput } from "@/components/forms/PhoneInput";

function TextField({
  name,
  label,
  defaultValue,
  hint,
  required,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  hint?: string;
  required?: boolean;
}) {
  return (
    <Field label={label} hint={hint} required={required}>
      <input
        name={name}
        required={required}
        maxLength={80}
        defaultValue={defaultValue ?? ""}
        className={inputClass}
      />
    </Field>
  );
}

export function RishtaProfileForm({
  defaults,
}: {
  defaults: RishtaProfile | null;
}) {
  const [state, formAction] = useFormState(saveRishtaProfileAction, emptyState);
  return (
    <form action={formAction} className="space-y-4">
      <FormError>{state.error}</FormError>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Profile posted by" required>
          <select
            name="postedBy"
            defaultValue={defaults?.postedBy ?? "SELF"}
            className={inputClass}
          >
            {Object.entries(POSTED_BY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="This profile is a" required>
          <select
            name="gender"
            defaultValue={defaults?.gender ?? "WOMAN"}
            className={inputClass}
          >
            <option value="WOMAN">Bride (girl)</option>
            <option value="MAN">Groom (boy)</option>
          </select>
        </Field>
        <TextField
          name="displayName"
          label="Name shown"
          hint="First name is enough"
          defaultValue={defaults?.displayName}
          required
        />
        <Field label="Birth year" required>
          <input
            name="birthYear"
            type="number"
            min={1940}
            max={new Date().getFullYear() - 18}
            required
            defaultValue={defaults?.birthYear ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Height">
          <select
            name="heightCm"
            defaultValue={defaults?.heightCm ?? ""}
            className={inputClass}
          >
            <option value="">Prefer not to say</option>
            {HEIGHTS_CM.map((cm) => (
              <option key={cm} value={cm}>
                {heightLabel(cm)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Marital status">
          <select
            name="maritalHistory"
            defaultValue={defaults?.maritalHistory ?? "NEVER_MARRIED"}
            className={inputClass}
          >
            {Object.entries(RISHTA_MARITAL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Religion">
          <select
            name="religion"
            defaultValue={defaults?.religion ?? ""}
            className={inputClass}
          >
            <option value="">Prefer not to say</option>
            {RELIGIONS.map((religion) => (
              <option key={religion}>{religion}</option>
            ))}
          </select>
        </Field>
        <TextField
          name="community"
          label="Community / caste"
          hint="Optional"
          defaultValue={defaults?.community}
        />
        <TextField
          name="gotra"
          label="Gotra"
          hint="Optional — used to flag same-gotra matches"
          defaultValue={defaults?.gotra}
        />
        <TextField
          name="motherTongue"
          label="Mother tongue"
          defaultValue={defaults?.motherTongue}
        />
        <TextField
          name="education"
          label="Education"
          defaultValue={defaults?.education}
        />
        <TextField
          name="profession"
          label="Profession"
          defaultValue={defaults?.profession}
        />
        <TextField
          name="city"
          label="City"
          defaultValue={defaults?.city}
          required
        />
        <TextField name="state" label="State" defaultValue={defaults?.state} />
        <TextField
          name="country"
          label="Country"
          defaultValue={defaults?.country}
        />
      </div>

      <fieldset className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
        <legend className="px-1 text-sm font-bold">
          🔮 Kundli match (optional)
        </legend>
        <p className="text-xs text-slate-600">
          Add the Moon sign and nakshatra to see a 36-guna match with other
          profiles. Don&apos;t know them?{" "}
          <Link
            href="/astrology/kundli-calculator"
            target="_blank"
            className="font-semibold text-violet-700 hover:underline"
          >
            Find them free
          </Link>
          . Birth date, time and place are never stored.
        </p>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <Field label="Rashi (Moon sign)">
            <select
              name="moonSign"
              defaultValue={defaults?.moonSign ?? ""}
              className={inputClass}
            >
              <option value="">Not sure</option>
              {RASHIS.map((rashi, index) => (
                <option key={rashi.name} value={index}>
                  {rashi.name} ({rashi.english})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Nakshatra">
            <select
              name="nakshatra"
              defaultValue={defaults?.nakshatra ?? ""}
              className={inputClass}
            >
              <option value="">Not sure</option>
              {NAKSHATRAS.map((name, index) => (
                <option key={name} value={index}>
                  {name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </fieldset>

      <Field
        label="About them and the family"
        hint="Education, work, values, family. No phone numbers or links."
        required
      >
        <textarea
          name="about"
          required
          rows={5}
          maxLength={1200}
          defaultValue={defaults?.about}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Photo" hint="JPG or PNG, up to 6 MB">
          <input
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className={inputClass}
          />
        </Field>
        <div className="space-y-2 pt-6 text-sm text-slate-700">
          <label className="flex gap-2">
            <input
              type="checkbox"
              name="hidePhoto"
              defaultChecked={defaults?.hidePhoto}
              className="mt-0.5 h-4 w-4"
            />
            Hide my photo (show &ldquo;Photo on request&rdquo; instead)
          </label>
          {defaults?.photoUrl ? (
            <label className="flex gap-2">
              <input
                type="checkbox"
                name="removePhoto"
                className="mt-0.5 h-4 w-4"
              />
              Remove the current photo
            </label>
          ) : null}
        </div>
      </div>

      <Field
        label="WhatsApp number"
        hint={`Shown to signed-in members only while your plan is Pro or Featured. ${DIAL_CODE_HINT}`}
      >
        <PhoneInput name="whatsapp" defaultValue={defaults?.whatsappNumber} />
      </Field>

      <label className="flex gap-2 rounded-2xl border border-slate-200 p-3 text-sm text-slate-700">
        <input
          type="checkbox"
          name="consent"
          required
          defaultChecked={Boolean(defaults)}
          className="mt-0.5 h-4 w-4"
        />
        <span>
          The person in this profile is 18 or older and agrees to it being
          posted. I&apos;ll do my own checks before any meeting and never send
          money.
        </span>
      </label>

      <FormSuccess>{state.success}</FormSuccess>
      <SubmitButton pendingLabel="Saving…">Save Rishta profile</SubmitButton>
    </form>
  );
}
