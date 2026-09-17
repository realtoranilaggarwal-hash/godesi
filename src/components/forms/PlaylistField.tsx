"use client";

import { useState } from "react";
import { Field, inputClass } from "@/components/ui";

const STEPS = [
  "Open youtube.com and sign in with the account that has your videos.",
  "Tap your profile picture → Your channel → Playlists (or Library → Playlists on your phone).",
  "Tap New playlist, name it (e.g. “Our weddings”), and set visibility to Public or Unlisted — not Private.",
  "Add videos: under any of your videos tap Save → tick the playlist.",
  "Open the playlist, tap Share → Copy link, paste it in the box above and save. Every time you add a video to the playlist it shows up here too.",
];

/**
 * One playlist link instead of pasting video links one by one: YouTube lists the
 * videos, we show them all, and new uploads appear as soon as they are added to
 * the playlist.
 */
export function PlaylistField({
  defaultValue = "",
  hint,
}: {
  defaultValue?: string;
  hint?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Field
      label="YouTube playlist link"
      hint={
        hint ??
        "Paste a public YouTube playlist link and every video in it shows on your page — add a video to the playlist and it appears here automatically."
      }
    >
      <input
        name="playlistUrl"
        type="url"
        inputMode="url"
        defaultValue={defaultValue}
        placeholder="https://www.youtube.com/playlist?list=..."
        className={inputClass}
      />
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="mt-2 text-xs font-semibold text-indigo-700 underline"
      >
        {open ? "Hide the steps" : "How do I get this link? (5 steps)"}
      </button>
      {open ? (
        <ol className="mt-2 list-decimal space-y-1 rounded-xl bg-indigo-50 p-3 pl-7 text-xs text-indigo-900">
          {STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      ) : null}
    </Field>
  );
}
