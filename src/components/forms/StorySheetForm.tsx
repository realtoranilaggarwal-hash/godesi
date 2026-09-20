"use client";

import { useFormState } from "react-dom";
import { saveStorySheetAction } from "@/app/actions/elite";
import { emptyState } from "@/lib/actions";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/forms/FormError";
import {
  PRIVATE_SECTION,
  STORY_SECTIONS,
  type StoryAnswers,
} from "@/lib/storySheet";

export function StorySheetForm({
  entryId,
  answers,
}: {
  entryId: string;
  answers: StoryAnswers;
}) {
  const [state, formAction] = useFormState(saveStorySheetAction, emptyState);

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="id" value={entryId} />
      <FormError>{state.error}</FormError>
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      {STORY_SECTIONS.map((section) => (
        <section
          key={section.title}
          className={
            section.title === PRIVATE_SECTION
              ? "rounded-2xl border border-amber-200 bg-amber-50 p-4"
              : ""
          }
        >
          <h2 className="text-lg font-black">{section.title}</h2>
          {section.intro ? (
            <p className="mt-1 text-sm text-slate-600">{section.intro}</p>
          ) : null}
          <div className="mt-3 space-y-4">
            {section.questions.map((question) => (
              <Field
                key={question.id}
                label={question.label}
                hint={question.hint}
              >
                {question.short ? (
                  <input
                    name={question.id}
                    defaultValue={answers[question.id] ?? ""}
                    maxLength={300}
                    className={inputClass}
                  />
                ) : (
                  <textarea
                    name={question.id}
                    defaultValue={answers[question.id] ?? ""}
                    rows={4}
                    maxLength={3000}
                    className={inputClass}
                  />
                )}
              </Field>
            ))}
          </div>
        </section>
      ))}

      <div className="sticky bottom-3 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">
        <p className="text-xs text-slate-500">
          Bullet points are fine — this is for the conversation, not for
          publishing word for word.
        </p>
        <SubmitButton pendingLabel="Saving…">Save my answers</SubmitButton>
      </div>
    </form>
  );
}
