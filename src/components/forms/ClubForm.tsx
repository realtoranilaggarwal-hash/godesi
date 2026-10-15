"use client";

import { useState, useTransition } from "react";
import { useFormState } from "react-dom";
import { createClubAction, updateClubAction } from "@/app/actions/clubs";
import { emptyState } from "@/lib/actions";
import { Button, Field, inputClass } from "@/components/ui";
import { FormError } from "@/components/forms/FormError";
import { ImageField } from "@/components/forms/ImageField";
import { PlaylistField } from "@/components/forms/PlaylistField";
import { CLUB_CATEGORIES, CLUB_RULE_PRESETS, splitRules } from "@/lib/clubs";

export type ClubFormValues = {
  id: string;
  name: string;
  description: string;
  category: string;
  visibility: "PUBLIC" | "PRIVATE";
  online: boolean;
  city: string | null;
  state: string | null;
  country: string | null;
  rules: string | null;
  imageUrl: string | null;
  playlistUrl: string | null;
  websiteUrl: string | null;
  whatsappUrl: string | null;
};

export function ClubForm({
  club,
  defaultCountry,
}: {
  club?: ClubFormValues;
  defaultCountry?: string;
}) {
  const rules = splitRules(club?.rules);
  const [state, formAction] = useFormState(
    club ? updateClubAction : createClubAction,
    emptyState,
  );
  const [online, setOnline] = useState(club?.online ?? false);
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">(
    club?.visibility ?? "PUBLIC",
  );
  const [pending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
      className="space-y-5"
    >
      {club ? <input type="hidden" name="clubId" value={club.id} /> : null}
      <FormError>{state.error}</FormError>

      <Field label="Club name" required>
        <input
          name="name"
          required
          minLength={3}
          maxLength={80}
          defaultValue={club?.name ?? ""}
          placeholder="Jersey Desi Singing Club"
          className={inputClass}
        />
      </Field>

      <Field label="Category" required>
        <select
          name="category"
          required
          defaultValue={club?.category ?? ""}
          className={inputClass}
        >
          <option value="" disabled>
            Pick one…
          </option>
          {CLUB_CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.emoji} {c.label}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="About the club"
        required
        hint="Who it is for, what you do when you meet, how often. This is what people read before they join."
      >
        <textarea
          name="description"
          required
          minLength={20}
          rows={5}
          defaultValue={club?.description ?? ""}
          placeholder="We meet every second Saturday for Bollywood karaoke — all levels welcome, bring a dish to share…"
          className={inputClass}
        />
      </Field>

      <fieldset className="space-y-2 rounded-2xl border border-slate-200 p-4">
        <legend className="px-1 text-sm font-bold text-slate-900">
          Who can join?
        </legend>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="radio"
            name="visibility"
            value="PUBLIC"
            checked={visibility === "PUBLIC"}
            onChange={() => setVisibility("PUBLIC")}
            className="mt-1"
          />
          <span>
            <span className="font-semibold">Public club</span> — anyone on
            GoDesi can find it and join straight away.
          </span>
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="radio"
            name="visibility"
            value="PRIVATE"
            checked={visibility === "PRIVATE"}
            onChange={() => setVisibility("PRIVATE")}
            className="mt-1"
          />
          <span>
            <span className="font-semibold">Private club</span> — listed by
            name; people request to join and an organiser approves them.
          </span>
        </label>
      </fieldset>

      <fieldset className="space-y-3 rounded-2xl border border-slate-200 p-4">
        <legend className="px-1 text-sm font-bold text-slate-900">
          Where do you meet?
        </legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="online"
            checked={online}
            onChange={(e) => setOnline(e.target.checked)}
          />
          We meet online (Zoom, WhatsApp, Discord)
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="City" required={!online}>
            <input
              name="city"
              required={!online}
              defaultValue={club?.city ?? ""}
              placeholder="Edison"
              className={inputClass}
            />
          </Field>
          <Field label="State / province">
            <input
              name="state"
              defaultValue={club?.state ?? ""}
              placeholder="NJ"
              className={inputClass}
            />
          </Field>
          <Field label="Country">
            <input
              name="country"
              defaultValue={club?.country ?? defaultCountry ?? ""}
              className={inputClass}
            />
          </Field>
        </div>
      </fieldset>

      <ImageField
        name="imageUrl"
        label="Club photo or logo"
        purpose="logo"
        defaultValue={club?.imageUrl ?? ""}
        previewClassName="h-24 w-24 rounded-xl object-cover"
      />

      <PlaylistField
        defaultValue={club?.playlistUrl ?? ""}
        hint="Optional — a public YouTube playlist or channel with the songs you sing or clips from past meets. Its videos show on the club page."
      />

      <Field
        label="Club rules"
        hint="Optional — tick the house rules members agree to, add your own below."
      >
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {CLUB_RULE_PRESETS.map((rule) => (
            <li key={rule}>
              <label className="flex items-start gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50">
                <input
                  type="checkbox"
                  name="rulePreset"
                  value={rule}
                  defaultChecked={rules.presets.includes(rule)}
                  className="mt-0.5"
                />
                <span>{rule}</span>
              </label>
            </li>
          ))}
        </ul>
        <textarea
          name="rulesExtra"
          rows={2}
          defaultValue={rules.extra}
          placeholder="Your own rules, one per line — e.g. RSVP by Thursday; songs in Hindi, Punjabi or English…"
          className={`${inputClass} mt-2`}
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Website or social page">
          <input
            name="websiteUrl"
            type="url"
            defaultValue={club?.websiteUrl ?? ""}
            placeholder="https://"
            className={inputClass}
          />
        </Field>
        <Field
          label="WhatsApp group invite link"
          hint="Shown to approved members only."
        >
          <input
            name="whatsappUrl"
            type="url"
            defaultValue={club?.whatsappUrl ?? ""}
            placeholder="https://chat.whatsapp.com/…"
            className={inputClass}
          />
        </Field>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : club ? "Save changes" : "Create the club"}
      </Button>
    </form>
  );
}
