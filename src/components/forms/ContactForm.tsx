"use client";

import { useFormState } from "react-dom";
import {
  CONTACT_TOPICS,
  sendContactMessageAction,
} from "@/app/actions/contact";
import { emptyState } from "@/lib/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { Alert, Field, inputClass } from "@/components/ui";

export function ContactForm({ defaultTopic }: { defaultTopic?: string }) {
  const [state, formAction] = useFormState(
    sendContactMessageAction,
    emptyState,
  );

  return (
    <form action={formAction} className="space-y-3">
      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Your name">
          <input name="name" required maxLength={80} className={inputClass} />
        </Field>
        <Field label="Email" hint="We reply here">
          <input name="email" type="email" required className={inputClass} />
        </Field>
        <Field label="Phone or WhatsApp" hint="Optional">
          <input name="phone" maxLength={30} className={inputClass} />
        </Field>
        <Field label="What is this about?">
          <select
            name="topic"
            required
            defaultValue={
              CONTACT_TOPICS.find((topic) => topic === defaultTopic) ??
              CONTACT_TOPICS[0]
            }
            className={inputClass}
          >
            {CONTACT_TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Your message">
        <textarea
          name="message"
          required
          rows={6}
          maxLength={2000}
          placeholder="Tell us what you need — include your listing name or link if it helps."
          className={inputClass}
        />
      </Field>

      <SubmitButton pendingLabel="Sending...">Send message</SubmitButton>
    </form>
  );
}
