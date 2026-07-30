"use client";

import { useFormState } from "react-dom";
import { requestWebsiteAction } from "@/app/actions/websiteOffer";
import { emptyState } from "@/lib/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { Alert, Field, inputClass } from "@/components/ui";
import { FormError } from "@/components/forms/FormError";
import { WEBSITE_OFFER_PAGE_PROMPTS } from "@/lib/websiteOffer";
import { PhoneInput } from "@/components/forms/PhoneInput";
import { DIAL_CODE_HINT } from "@/lib/dialCodes";

export function WebsiteRequestForm({
  defaultBusinessName,
  defaultCity,
  defaultEmail,
  defaultPhone,
}: {
  defaultBusinessName?: string;
  defaultCity?: string;
  defaultEmail?: string;
  defaultPhone?: string;
}) {
  const [state, formAction] = useFormState(requestWebsiteAction, emptyState);

  return (
    <form action={formAction} className="space-y-4">
      <FormError>{state.error}</FormError>
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Business name">
          <input
            name="businessName"
            required
            maxLength={120}
            defaultValue={defaultBusinessName ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Your name">
          <input name="contactName" required maxLength={80} className={inputClass} />
        </Field>
        <Field label="Email" hint="We reply here">
          <input
            name="email"
            type="email"
            required
            defaultValue={defaultEmail ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Phone" hint={DIAL_CODE_HINT}>
          <PhoneInput name="phone" required defaultValue={defaultPhone ?? ""} />
        </Field>
        <Field
          label="WhatsApp"
          hint={`Optional — if different from your phone. ${DIAL_CODE_HINT}`}
        >
          <PhoneInput name="whatsapp" />
        </Field>
        <Field label="City">
          <input
            name="city"
            required
            maxLength={80}
            defaultValue={defaultCity ?? ""}
            className={inputClass}
          />
        </Field>
        <Field
          label="Google Business Profile link"
          hint="Paste it if you have one — we link and match your details"
        >
          <input
            name="googleProfileUrl"
            type="url"
            placeholder="https://maps.app.goo.gl/…"
            className={inputClass}
          />
        </Field>
        <Field label="Existing site or social page" hint="Optional">
          <input
            name="existingUrl"
            maxLength={200}
            placeholder="instagram.com/yourbusiness"
            className={inputClass}
          />
        </Field>
      </div>

      <fieldset className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
        <legend className="px-1 text-sm font-bold text-slate-900">
          Your 5 pages
        </legend>
        <p className="text-xs text-slate-500">
          A line or two per page is enough — we write and design the rest, then send
          you a draft to approve.
        </p>
        {WEBSITE_OFFER_PAGE_PROMPTS.map((prompt) => (
          <Field key={prompt.name} label={prompt.label} hint={prompt.hint}>
            <textarea
              name={prompt.name}
              rows={2}
              maxLength={800}
              className={inputClass}
            />
          </Field>
        ))}
      </fieldset>

      <Field label="Anything else?" hint="Domain you own, logo, colours, deadline">
        <textarea name="notes" rows={3} maxLength={2000} className={inputClass} />
      </Field>

      <SubmitButton pendingLabel="Sending...">Send my website brief</SubmitButton>
    </form>
  );
}
