"use client";

import { useFormState } from "react-dom";
import { reportIssueAction } from "@/app/actions/report";
import { emptyState } from "@/lib/actions";
import { REPORT_ISSUE_TYPES } from "@/lib/safety";
import { Alert, Field, inputClass } from "@/components/ui";
import { ImageField } from "@/components/forms/ImageField";
import { SubmitButton } from "@/components/SubmitButton";

export function ReportIssueForm({
  defaultName,
  defaultEmail,
  defaultSubject,
}: {
  defaultName?: string;
  defaultEmail?: string;
  defaultSubject?: string;
}) {
  const [state, formAction] = useFormState(reportIssueAction, emptyState);

  if (state.success) return <Alert tone="success">{state.success}</Alert>;

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? <Alert>{state.error}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name">
          <input
            name="name"
            required
            defaultValue={defaultName ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Your email">
          <input
            name="email"
            type="email"
            required
            defaultValue={defaultEmail ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Vendor or listing name" hint="A link to the page helps us act faster">
        <input
          name="subject"
          required
          defaultValue={defaultSubject ?? ""}
          className={inputClass}
        />
      </Field>

      <Field label="Issue type">
        <select name="issueType" required className={inputClass}>
          {REPORT_ISSUE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </Field>

      <Field label="What happened?">
        <textarea name="description" rows={5} required className={inputClass} />
      </Field>

      <ImageField
        name="evidenceUrl"
        label="Attach a screenshot"
        purpose="gallery"
        hint="Optional — chat screenshots, receipts or photos help us review"
        previewClassName="h-28 w-28 rounded-xl object-cover"
      />

      <SubmitButton pendingLabel="Sending...">Submit report</SubmitButton>
    </form>
  );
}
