"use client";

import { useFormState } from "react-dom";
import { sendContactMessageAction } from "@/app/actions/contact";
import { CONTACT_TOPICS } from "@/lib/contact";
import { emptyState } from "@/lib/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { Field, inputClass } from "@/components/ui";
import { FormError } from "@/components/forms/FormError";
import { PhoneInput } from "@/components/forms/PhoneInput";
import { DIAL_CODE_HINT } from "@/lib/dialCodes";
import { FormSuccess } from "@/components/forms/FormSuccess";

export function ContactForm({ defaultTopic }: { defaultTopic?: string }) {
  const [state, formAction] = useFormState(
    sendContactMessageAction,
    emptyState,
  );

  return (
    <form action={formAction} className="space-y-3">
      <FormError>{state.error}</FormError>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Your name">
          <input name="name" required maxLength={80} className={inputClass} />
        </Field>
        <Field label="Email" hint="We reply here">
          <input name="email" type="email" required className={inputClass} />
        </Field>
        <Field label="Phone or WhatsApp" hint={`Optional. ${DIAL_CODE_HINT}`}>
          <PhoneInput name="phone" />
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

      <FormSuccess>{state.success}</FormSuccess>
      <SubmitButton pendingLabel="Sending...">Send message</SubmitButton>
    </form>
  );
}
