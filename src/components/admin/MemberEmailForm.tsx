"use client";

import { useFormState } from "react-dom";
import { useState } from "react";
import { emailMemberAction } from "@/app/actions/members";
import { emptyState } from "@/lib/actions";
import { Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/forms/FormError";

export function MemberEmailForm({
  memberId,
  templates,
}: {
  memberId: string;
  templates: { key: string; label: string; subject: string }[];
}) {
  const [state, formAction] = useFormState(emailMemberAction, emptyState);
  const [template, setTemplate] = useState(templates[0]?.key ?? "custom");

  return (
    <form action={formAction} className="space-y-3">
      <FormError>{state.error}</FormError>
      {state.success ? (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {state.success}
        </p>
      ) : null}
      <input type="hidden" name="id" value={memberId} />

      <Field label="Message">
        <select
          name="template"
          value={template}
          onChange={(event) => setTemplate(event.target.value)}
          className={inputClass}
        >
          {templates.map((entry) => (
            <option key={entry.key} value={entry.key}>
              {entry.label}
            </option>
          ))}
          <option value="custom">Write my own…</option>
        </select>
      </Field>

      {template === "custom" ? (
        <>
          <Field label="Subject">
            <input name="subject" className={inputClass} required />
          </Field>
          <Field label="Message" hint="Plain text; a blank line starts a new paragraph.">
            <textarea name="message" rows={6} className={inputClass} required />
          </Field>
        </>
      ) : (
        <p className="text-sm text-slate-500">
          Subject: {templates.find((entry) => entry.key === template)?.subject}
        </p>
      )}

      <SubmitButton pendingLabel="Sending…">Send email</SubmitButton>
    </form>
  );
}
