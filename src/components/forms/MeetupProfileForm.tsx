"use client";

import type { ReactNode } from "react";
import { useFormState } from "react-dom";
import { saveMeetupProfileAction } from "@/app/actions/meetups";
import { emptyState } from "@/lib/actions";
import {
  AGE_RANGES,
  CONNECT_INTERESTS,
  GENDER_LABELS,
  MARITAL_LABELS,
  MEET_RADII_MILES,
  MEETUP_INTENT_GROUPS,
  MEETUP_INTENT_NOTE,
  MEETUP_MAX_AGE,
  MEETUP_MIN_AGE,
} from "@/lib/meetups";
import { SubmitButton } from "@/components/SubmitButton";
import { Field, inputClass } from "@/components/ui";
import { FormError } from "@/components/forms/FormError";
import { PhoneInput } from "@/components/forms/PhoneInput";
import { DIAL_CODE_HINT } from "@/lib/dialCodes";
import { FormSuccess } from "@/components/forms/FormSuccess";

export type MeetupProfileDefaults = {
  displayName: string;
  age: number | null;
  gender: string;
  marital: string;
  city: string;
  state: string;
  intents: string[];
  interests: string[];
  ageRange: string;
  meetRadiusMiles: number | null;
  bio: string;
  whatsappNumber: string;
  visiting: boolean;
};

function Chip({
  type,
  name,
  value,
  checked,
  children,
}: {
  type: "checkbox" | "radio";
  name: string;
  value: string;
  checked: boolean;
  children: ReactNode;
}) {
  return (
    <label className="cursor-pointer">
      <input
        type={type}
        name={name}
        value={value}
        defaultChecked={checked}
        className="peer sr-only"
      />
      <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:border-indigo-300 peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-400">
        {children}
      </span>
    </label>
  );
}

export function MeetupProfileForm({
  defaults,
}: {
  defaults?: MeetupProfileDefaults;
}) {
  const [state, formAction] = useFormState(saveMeetupProfileAction, emptyState);

  return (
    <form action={formAction} className="space-y-4">
      <FormError>{state.error}</FormError>

      <fieldset className="rounded-2xl border border-slate-200 p-4">
        <legend className="px-1 text-sm font-bold text-slate-900">
          I&rsquo;m looking for
        </legend>
        <p className="text-xs text-slate-500">{MEETUP_INTENT_NOTE}</p>
        <div className="mt-3 space-y-3">
          {MEETUP_INTENT_GROUPS.map((group) => (
            <div key={group.id}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {group.label}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {group.intents.map((intent) => (
                  <Chip
                    key={intent.id}
                    type="checkbox"
                    name="intents"
                    value={intent.id}
                    checked={Boolean(defaults?.intents.includes(intent.id))}
                  >
                    {intent.label}
                  </Chip>
                ))}
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="rounded-2xl border border-slate-200 p-4">
        <legend className="px-1 text-sm font-bold text-slate-900">
          I enjoy
        </legend>
        <p className="text-xs text-slate-500">
          We use these to suggest people and clubs that share them.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {CONNECT_INTERESTS.map((interest) => (
            <Chip
              key={interest.slug}
              type="checkbox"
              name="interests"
              value={interest.slug}
              checked={Boolean(defaults?.interests.includes(interest.slug))}
            >
              <span aria-hidden>{interest.emoji}</span> {interest.label}
            </Chip>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-2">
        <fieldset className="rounded-2xl border border-slate-200 p-4">
          <legend className="px-1 text-sm font-bold text-slate-900">
            Suggest people aged
          </legend>
          <div className="mt-1 flex flex-wrap gap-2">
            <Chip
              type="radio"
              name="ageRange"
              value=""
              checked={!defaults?.ageRange}
            >
              Any age
            </Chip>
            {AGE_RANGES.map((range) => (
              <Chip
                key={range.id}
                type="radio"
                name="ageRange"
                value={range.id}
                checked={defaults?.ageRange === range.id}
              >
                {range.label}
              </Chip>
            ))}
          </div>
        </fieldset>
        <fieldset className="rounded-2xl border border-slate-200 p-4">
          <legend className="px-1 text-sm font-bold text-slate-900">
            How far
          </legend>
          <div className="mt-1 flex flex-wrap gap-2">
            {MEET_RADII_MILES.map((miles) => (
              <Chip
                key={miles}
                type="radio"
                name="meetRadiusMiles"
                value={String(miles)}
                checked={defaults?.meetRadiusMiles === miles}
              >
                {miles} miles
              </Chip>
            ))}
            <Chip
              type="radio"
              name="meetRadiusMiles"
              value=""
              checked={!defaults?.meetRadiusMiles}
            >
              Anywhere / online
            </Chip>
          </div>
        </fieldset>
      </div>

      <h2 className="pt-2 text-sm font-bold text-slate-900">About me</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Display name" hint="First name or nickname is fine">
          <input
            name="displayName"
            required
            defaultValue={defaults?.displayName}
            className={inputClass}
          />
        </Field>
        <Field
          label="Age"
          hint="Optional — leave it blank if you would rather not share it"
        >
          <input
            name="age"
            type="number"
            min={MEETUP_MIN_AGE}
            max={MEETUP_MAX_AGE}
            defaultValue={defaults?.age ?? ""}
            placeholder="Prefer not to share"
            className={inputClass}
          />
        </Field>
        <Field label="I am">
          <select
            name="gender"
            defaultValue={defaults?.gender ?? "WOMAN"}
            className={inputClass}
          >
            {Object.entries(GENDER_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Marital status">
          <select
            name="marital"
            defaultValue={defaults?.marital ?? "PREFER_NOT_SAY"}
            className={inputClass}
          >
            {Object.entries(MARITAL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="City">
          <input
            name="city"
            required
            defaultValue={defaults?.city}
            className={inputClass}
          />
        </Field>
        <Field label="State / region" hint="Optional">
          <input
            name="state"
            defaultValue={defaults?.state}
            className={inputClass}
          />
        </Field>
      </div>

      <Field
        label="About you"
        hint="What you do, what you would like to meet about. No phone numbers, links or adult content."
      >
        <textarea
          name="bio"
          required
          rows={4}
          maxLength={600}
          defaultValue={defaults?.bio}
          className={inputClass}
        />
      </Field>

      <Field
        label="WhatsApp number"
        hint={`Optional — shown to signed-in members only. ${DIAL_CODE_HINT}`}
      >
        <PhoneInput name="whatsapp" defaultValue={defaults?.whatsappNumber} />
      </Field>

      <label className="flex gap-2 rounded-2xl bg-cyan-50 p-3 text-sm text-slate-700">
        <input
          type="checkbox"
          name="visiting"
          defaultChecked={defaults?.visiting}
          className="mt-0.5 h-4 w-4 rounded border-slate-300"
        />
        <span>
          I am travelling or new in this city — show a &ldquo;visiting / new
          here&rdquo; tag so locals can say hello.
        </span>
      </label>

      <fieldset className="space-y-3 rounded-2xl border border-slate-200 p-4">
        <legend className="px-1 text-sm font-bold text-slate-900">
          Before you publish
        </legend>
        <label className="flex gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            name="adult"
            required
            defaultChecked={Boolean(defaults)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300"
          />
          <span>
            I confirm I am {MEETUP_MIN_AGE} or older. Sharing my exact age is
            optional.
          </span>
        </label>
        <label className="flex gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            name="risk"
            required
            defaultChecked={Boolean(defaults)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300"
          />
          <span>
            I understand that I meet or greet other members entirely at my own
            risk. Godesi does not verify members, is not part of any meeting and
            I will do my own due diligence — meet in public places and never
            send money.
          </span>
        </label>
      </fieldset>

      <FormSuccess>{state.success}</FormSuccess>
      <SubmitButton pendingLabel="Saving…">
        Save my Connect profile
      </SubmitButton>
      <p className="text-xs text-slate-500">
        Connect is for networking, community and activities. Dating or adult
        content is removed and the account blocked.
      </p>
    </form>
  );
}
