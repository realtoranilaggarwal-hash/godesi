"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { savePersonalProfileAction } from "@/app/actions/profile";
import { emptyState } from "@/lib/actions";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { ImageDropzone } from "@/components/ImageDropzone";

export type PersonalProfileValues = {
  name: string;
  username: string;
  bio: string | null;
  location: string | null;
  avatarUrl: string | null;
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

      <Field label="Bio" hint="A couple of lines about you — max 500 characters">
        <textarea
          name="bio"
          rows={4}
          defaultValue={profile.bio ?? ""}
          className={inputClass}
        />
      </Field>

      <SubmitButton pendingLabel="Saving...">Save my profile</SubmitButton>
    </form>
  );
}
