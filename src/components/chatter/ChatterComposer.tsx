"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { createChatterPostAction } from "@/app/actions/chatter";
import { emptyState } from "@/lib/actions";
import { CHATTER_LANGUAGES, CHATTER_MAX, CHATTER_TOPICS } from "@/lib/chatter";
import { SubmitButton } from "@/components/SubmitButton";
import { inputClass } from "@/components/ui";

/** New post, or a reply when `parentId` is given (topic and city follow the post). */
export function ChatterComposer({
  parentId,
  defaultCity,
  defaultTopic,
  uploads,
}: {
  parentId?: string;
  defaultCity?: string | null;
  defaultTopic?: string;
  uploads: boolean;
}) {
  const [state, formAction] = useFormState(createChatterPostAction, emptyState);
  const [length, setLength] = useState(0);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      form.current?.reset();
      setLength(0);
    }
  }, [state]);

  return (
    <form ref={form} action={formAction} className="space-y-3">
      {parentId ? (
        <input type="hidden" name="parentId" value={parentId} />
      ) : null}
      <textarea
        name="body"
        required
        rows={parentId ? 2 : 3}
        maxLength={CHATTER_MAX}
        onChange={(event) => setLength(event.target.value.length)}
        placeholder={
          parentId
            ? "Write a reply…"
            : "What's on your mind? Add #words so others can find it."
        }
        aria-label={parentId ? "Your reply" : "Your post"}
        className={`${inputClass} resize-y`}
      />
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {parentId ? null : (
          <>
            <select
              name="topic"
              defaultValue={defaultTopic ?? "general"}
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
              defaultValue={defaultCity ?? ""}
              maxLength={60}
              placeholder="City (optional)"
              aria-label="City"
              className="w-36 rounded-lg border border-slate-300 px-2 py-1.5"
            />
          </>
        )}
        <select
          name="language"
          defaultValue="en"
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
          <label className="cursor-pointer rounded-lg border border-slate-300 px-2 py-1.5 text-slate-600 hover:bg-slate-50">
            📷 Photo
            <input
              type="file"
              name="photo"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
            />
          </label>
        ) : null}
        <span
          className={`ml-auto text-xs ${length > CHATTER_MAX - 30 ? "text-rose-600" : "text-slate-400"}`}
        >
          {length}/{CHATTER_MAX}
        </span>
        <SubmitButton pendingLabel="Posting…">
          {parentId ? "Reply" : "Post"}
        </SubmitButton>
      </div>
      {state.error ? (
        <p className="text-sm text-rose-600">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-emerald-700">{state.success}</p>
      ) : null}
    </form>
  );
}
