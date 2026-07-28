"use client";

import { useFormState } from "react-dom";
import { saveMeetupProfileAction } from "@/app/actions/meetups";
import { emptyState } from "@/lib/actions";
import {
  GENDER_LABELS,
  MARITAL_LABELS,
  MEETUP_INTENT_GROUPS,
  MEETUP_INTENT_NOTE,
  MEETUP_MAX_AGE,
  MEETUP_MIN_AGE,
} from "@/lib/meetups";
import { SubmitButton } from "@/components/SubmitButton";
import { Alert, Field, inputClass } from "@/components/ui";
import { FormError } from "@/components/forms/FormError";

export type MeetupProfileDefaults = {
  displayName: string;
  age: number | null;
  gender: string;
  marital: string;
  city: string;
  state: string;
  intents: string[];
  bio: string;
  whatsappNumber: string;
  visiting: boolean;
};

export function MeetupProfileForm({
  defaults,
}: {
  defaults?: MeetupProfileDefaults;
}) {
  const [state, formAction] = useFormState(saveMeetupProfileAction, emptyState);

  return (
    <form action={formAction} className="space-y-4">
      <FormError>{state.error}</FormError>
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
        <p className="text-xs text-slate-500">{MEETUP_INTENT_NOTE}</p>
        <div className="mt-3 space-y-4">
          {MEETUP_INTENT_GROUPS.map((group) => (
            <div key={group.id}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {group.label}
              </p>
              <div className="mt-1 grid gap-2 sm:grid-cols-2">
                {group.intents.map((intent) => (
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
            </div>
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
            I will do my own due diligence — meet in public places and never send
            money.
          </span>
        </label>
      </fieldset>

      <SubmitButton pendingLabel="Saving…">Save my Connect profile</SubmitButton>
      <p className="text-xs text-slate-500">
        Connect is for networking, community and activities. Dating or adult content is
        removed and the account blocked.
      </p>
    </form>
  );
}
