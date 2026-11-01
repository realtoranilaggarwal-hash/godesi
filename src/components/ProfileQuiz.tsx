"use client";

import { useState, useTransition } from "react";
import { saveProfileQuizAction } from "@/app/actions/profile";
import { PROFILE_QUESTIONS } from "@/lib/profileQuiz";

/**
 * The friendly post-signup checklist: a few optional questions whose answers
 * become the "Get to know me" card on the member's public profile.
 */
export function ProfileQuiz({ initial }: { initial: Record<string, string> }) {
  const [answers, setAnswers] = useState<Record<string, string>>(initial);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const answered = PROFILE_QUESTIONS.filter((q) => answers[q.key]?.trim()).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-1">
        <p className="text-sm font-bold text-slate-900">
          ✨ Get to know me — a few fun questions
        </p>
        <span className="text-xs font-semibold text-slate-500">
          {answered} of {PROFILE_QUESTIONS.length} answered · shown on your public page
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {PROFILE_QUESTIONS.map((question) => (
          <label key={question.key} className="block">
            <span className="text-xs font-semibold text-slate-700">
              {question.emoji} {question.question}
            </span>
            <input
              type="text"
              maxLength={200}
              placeholder={question.placeholder}
              value={answers[question.key] ?? ""}
              onChange={(event) =>
                setAnswers((prev) => ({
                  ...prev,
                  [question.key]: event.target.value,
                }))
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </label>
        ))}
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await saveProfileQuizAction(answers);
            setDone(true);
          })
        }
        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {pending ? "Saving…" : done ? "Saved ✓ — on your profile now" : "Save to my profile"}
      </button>
    </div>
  );
}
