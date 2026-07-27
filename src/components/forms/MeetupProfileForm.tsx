"use client";

import { useFormState } from "react-dom";
import { saveMeetupProfileAction } from "@/app/actions/meetups";
import { emptyState } from "@/lib/actions";
import {
  GENDER_LABELS,
  MARITAL_LABELS,
  MEETUP_INTENTS,
  MEETUP_MAX_AGE,
  MEETUP_MIN_AGE,
} from "@/lib/meetups";
import { SubmitButton } from "@/components/SubmitButton";
import { Alert, Field, inputClass } from "@/components/ui";

export type MeetupProfileDefaults = {
  displayName: string;
  age: number;
  gender: string;
  marital: string;
  city: string;
  state: string;
  intents: string[];
  bio: string;
  whatsappNumber: string;
};

export function MeetupProfileForm({
  defaults,
}: {
  defaults?: MeetupProfileDefaults;
}) {
  const [state, formAction] = useFormState(saveMeetupProfileAction, emptyState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Display name" hint="First name or nickname is fine">
          <input
            name="displayName"
            required
            defaultValue={defaults?.displayName}
            className={inputClass}
          />
        </Field>
        <Field label="Age" hint="18+ only">
          <input
            name="age"
            type="number"
            required
            min={MEETUP_MIN_AGE}
            max={MEETUP_MAX_AGE}
            defaultValue={defaults?.age}
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
          <input name="city" required defaultValue={defaults?.city} className={inputClass} />
        </Field>
        <Field label="State / region" hint="Optional">
          <input name="state" defaultValue={defaults?.state} className={inputClass} />
        </Field>
      </div>

      <fieldset className="rounded-2xl border border-slate-200 p-4">
        <legend className="px-1 text-sm font-bold text-slate-900">
          I am open to
        </legend>
        <div className="mt-1 grid gap-2 sm:grid-cols-2">
          {MEETUP_INTENTS.map((intent) => (
            <label key={intent.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="intents"
                value={intent.id}
                defaultChecked={defaults?.intents.includes(intent.id)}
                className="h-4 w-4 rounded border-slate-300"
              />
              {intent.label}
            </label>
          ))}
        </div>
      </fieldset>

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

      <Field label="WhatsApp number" hint="Optional — shown to signed-in members only">
        <input
          name="whatsapp"
          defaultValue={defaults?.whatsappNumber}
          placeholder="+1 555 123 4567"
          className={inputClass}
        />
      </Field>

      <SubmitButton pendingLabel="Saving…">Save my Connect profile</SubmitButton>
      <p className="text-xs text-slate-500">
        Connect is for business, coffee and friendly conversation only. Dating, adult or
        sexual content is removed and the account blocked.
      </p>
    </form>
  );
}
