"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { savePersonalProfileAction } from "@/app/actions/profile";
import { emptyState } from "@/lib/actions";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { WriteHelper } from "@/components/WriteHelper";
import { ImageDropzone } from "@/components/ImageDropzone";
import { PERSONAL_SOCIALS } from "@/lib/personalProfile";

export type PersonalProfileValues = {
  name: string;
  username: string;
  bio: string | null;
  location: string | null;
  avatarUrl: string | null;
  headline: string | null;
  lookingFor: string | null;
  education: string | null;
  experience: string | null;
  skills: string[];
  languages: string[];
  videoUrls: string[];
  openToWork: boolean;
  whatsappNumber: string | null;
  socials: Record<string, string | null>;
};

export function PersonalProfileForm({
  profile,
  suggestedUsername,
}: {
  profile: PersonalProfileValues;
  suggestedUsername: string;
}) {
  const [state, formAction] = useFormState(savePersonalProfileAction, emptyState);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex flex-col items-center gap-2">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt="Your profile photo"
              className="h-24 w-24 rounded-full border border-slate-200 object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 via-rose-500 to-fuchsia-600 text-3xl font-black text-white">
              {profile.name.slice(0, 1).toUpperCase()}
            </div>
          )}
          {avatarUrl ? (
            <button
              type="button"
              onClick={() => setAvatarUrl("")}
              className="text-xs font-semibold text-red-600 hover:underline"
            >
              Remove photo
            </button>
          ) : null}
        </div>
        <div className="flex-1">
          <ImageDropzone
            purpose="avatar"
            label="Drag & drop your photo, or click to choose"
            hint="Square photos look best — we resize and compress it for you."
            onUploaded={setAvatarUrl}
          />
        </div>
      </div>
      <input type="hidden" name="avatarUrl" value={avatarUrl} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name">
          <input name="name" defaultValue={profile.name} required className={inputClass} />
        </Field>
        <Field label="Username" hint="Your profile lives at godesi.com/username">
          <input
            name="username"
            defaultValue={profile.username || suggestedUsername}
            required
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Location" hint="City, state or country">
        <input
          name="location"
          defaultValue={profile.location ?? ""}
          className={inputClass}
        />
      </Field>

      <Field
        label="Headline"
        hint="One line under your name — e.g. Wedding photographer & drone pilot, Toronto"
      >
        <input
          name="headline"
          maxLength={120}
          defaultValue={profile.headline ?? ""}
          className={inputClass}
        />
      </Field>

      <Field label="About me" hint="A couple of lines about you — max 500 characters">
        <textarea
          name="bio"
          rows={4}
          defaultValue={profile.bio ?? ""}
          className={inputClass}
        />
        <WriteHelper
          kind="profile"
          target="bio"
          photoTarget={false}
          fields={{
            headline: "Headline",
            location: "City",
            lookingFor: "Looking for",
          }}
        />
      </Field>

      <Field
        label="What I am looking for"
        hint="Clients, a job, partners, a mentor, a room, community — say it plainly"
      >
        <textarea
          name="lookingFor"
          rows={3}
          maxLength={500}
          defaultValue={profile.lookingFor ?? ""}
          className={inputClass}
        />
      </Field>

      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <input
          type="checkbox"
          name="openToWork"
          defaultChecked={profile.openToWork}
          className="h-4 w-4"
        />
        Show an &ldquo;open to work / available for projects&rdquo; badge
      </label>

      <Field
        label="Education"
        hint="School, college, degrees or courses — one per line"
      >
        <textarea
          name="education"
          rows={3}
          maxLength={800}
          defaultValue={profile.education ?? ""}
          className={inputClass}
        />
      </Field>

      <Field
        label="Work & achievements"
        hint="Roles, projects, awards — one per line"
      >
        <textarea
          name="experience"
          rows={4}
          maxLength={1200}
          defaultValue={profile.experience ?? ""}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Skills & interests" hint="Comma separated">
          <input
            name="skills"
            defaultValue={profile.skills.join(", ")}
            className={inputClass}
          />
        </Field>
        <Field label="Languages" hint="Comma separated">
          <input
            name="languages"
            defaultValue={profile.languages.join(", ")}
            className={inputClass}
          />
        </Field>
      </div>

      <Field
        label="Videos"
        hint="YouTube or Vimeo links, one per line — up to 3 play on your profile"
      >
        <textarea
          name="videoUrls"
          rows={3}
          defaultValue={profile.videoUrls.join("\n")}
          className={inputClass}
        />
      </Field>

      <Field
        label="WhatsApp number"
        hint="Optional — shows a chat button. Leave empty to keep it private."
      >
        <input
          name="whatsappNumber"
          defaultValue={profile.whatsappNumber ?? ""}
          placeholder="+1 416 555 0134"
          className={inputClass}
        />
      </Field>

      <details className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <summary className="cursor-pointer text-sm font-bold text-slate-800">
          Social links ({PERSONAL_SOCIALS.length} options)
        </summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {PERSONAL_SOCIALS.map((social) => (
            <Field key={social.key} label={`${social.icon} ${social.label}`}>
              <input
                name={social.key}
                type="url"
                placeholder={social.placeholder}
                defaultValue={profile.socials[social.key] ?? ""}
                className={inputClass}
              />
            </Field>
          ))}
        </div>
      </details>

      <SubmitButton pendingLabel="Saving...">Save my profile</SubmitButton>
    </form>
  );
}
