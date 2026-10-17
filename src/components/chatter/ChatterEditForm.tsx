"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { editChatterPostAction } from "@/app/actions/chatter";
import { emptyState } from "@/lib/actions";
import {
  CHATTER_LANGUAGES,
  CHATTER_MAX,
  CHATTER_TOPICS,
} from "@/lib/chatterConstants";
import { SubmitButton } from "@/components/SubmitButton";
import { inputClass } from "@/components/ui";

export function ChatterEditForm({
  post,
  uploads,
}: {
  post: {
    id: string;
    body: string;
    topic: string;
    city: string | null;
    language: string;
    imageUrl: string | null;
    isReply: boolean;
  };
  uploads: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(editChatterPostAction, emptyState);
  const [length, setLength] = useState(post.body.length);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-slate-500 hover:text-indigo-700"
      >
        ✏️ Edit
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="w-full space-y-2 rounded-lg bg-slate-50 p-3"
    >
      <input type="hidden" name="id" value={post.id} />
      <textarea
        name="body"
        required
        rows={3}
        maxLength={CHATTER_MAX}
        defaultValue={post.body}
        onChange={(event) => setLength(event.target.value.length)}
        aria-label="Edit your post"
        className={inputClass}
      />
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {post.isReply ? null : (
          <>
            <select
              name="topic"
              defaultValue={post.topic}
              aria-label="Topic"
              className="rounded-lg border border-slate-300 px-2 py-1.5"
            >
              {CHATTER_TOPICS.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.emoji} {topic.label}
                </option>
              ))}
            </select>
            <input
              name="city"
              defaultValue={post.city ?? ""}
              maxLength={60}
              placeholder="City (optional)"
              aria-label="City"
              className="w-36 rounded-lg border border-slate-300 px-2 py-1.5"
            />
          </>
        )}
        <select
          name="language"
          defaultValue={post.language}
          aria-label="Language"
          className="rounded-lg border border-slate-300 px-2 py-1.5"
        >
          {CHATTER_LANGUAGES.map((language) => (
            <option key={language.code} value={language.code}>
              {language.label}
            </option>
          ))}
        </select>
        {uploads ? (
          <label className="text-xs text-slate-600">
            New photo{" "}
            <input
              type="file"
              name="photo"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="text-xs"
            />
          </label>
        ) : null}
        {post.imageUrl ? (
          <label className="text-xs text-slate-600">
            <input type="checkbox" name="removePhoto" /> Remove photo
          </label>
        ) : null}
        <span className="ml-auto text-xs text-slate-400">
          {length}/{CHATTER_MAX}
        </span>
        <SubmitButton>Save</SubmitButton>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs font-semibold text-slate-500"
        >
          Close
        </button>
      </div>
      {state.error ? (
        <p className="text-xs text-rose-600">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-xs text-emerald-700">{state.success}</p>
      ) : null}
    </form>
  );
}
