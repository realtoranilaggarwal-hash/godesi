"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { requestSocialGrowthOrder } from "@/app/actions/socialGrowth";
import { emptyState } from "@/lib/actions";
import { RECAPTCHA_SITE_KEY } from "@/lib/recaptcha";
import {
  SOCIAL_PLATFORMS,
  SOCIAL_SERVICES,
  formatSocialQty,
  formatSocialUsd,
  socialService,
} from "@/lib/socialGrowth";
import { SubmitButton } from "@/components/SubmitButton";
import { Field, inputClass } from "@/components/ui";
import { CaptchaField } from "@/components/forms/CaptchaField";
import { FormError } from "@/components/forms/FormError";
import { FormSuccess } from "@/components/forms/FormSuccess";

export function SocialGrowthOrderForm({ source }: { source: "upgrade" | "proposal" }) {
  const [state, formAction] = useFormState(requestSocialGrowthOrder, emptyState);
  const [slug, setSlug] = useState(SOCIAL_SERVICES[0].slug);
  const service = socialService(slug) ?? SOCIAL_SERVICES[0];
  const [qty, setQty] = useState(service.packages[0].qty);

  return (
    <form action={formAction} className="space-y-3">
      <FormError>{state.error}</FormError>
      <input type="hidden" name="source" value={source} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Service" required>
          <select
            name="service"
            value={slug}
            onChange={(event) => {
              const next = socialService(event.target.value) ?? SOCIAL_SERVICES[0];
              setSlug(next.slug);
              setQty(next.packages[0].qty);
            }}
            className={inputClass}
          >
            {SOCIAL_PLATFORMS.map((platform) => (
              <optgroup key={platform} label={platform}>
                {SOCIAL_SERVICES.filter((item) => item.platform === platform).map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </Field>
        <Field label="Package" required>
          <select
            name="qty"
            value={qty}
            onChange={(event) => setQty(Number(event.target.value))}
            className={inputClass}
          >
            {service.packages.map((pkg) => (
              <option key={pkg.qty} value={pkg.qty}>
                {formatSocialQty(pkg.qty)} {service.unit} — {formatSocialUsd(pkg.priceUsd)}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Link to your profile, page or post"
          hint="Keep the account public until the order is done."
          required
          className="sm:col-span-2"
        >
          <input name="link" required maxLength={300} inputMode="url" placeholder="https://…" className={inputClass} />
        </Field>
        <Field label="Your name" required>
          <input name="name" required maxLength={80} className={inputClass} />
        </Field>
        <Field label="Phone or WhatsApp" required>
          <input name="phone" type="tel" required maxLength={30} className={inputClass} />
        </Field>
        <Field label="Email" required className="sm:col-span-2">
          <input name="email" type="email" required maxLength={120} className={inputClass} />
        </Field>
      </div>
      <CaptchaField siteKey={RECAPTCHA_SITE_KEY} />
      <FormSuccess>{state.success}</FormSuccess>
      <SubmitButton pendingLabel="Sending…">Request this order</SubmitButton>
      <p className="text-xs text-slate-500">
        No card needed. We call or text you to take payment by Venmo, Zelle or phone, and your order
        starts once it&apos;s paid.
      </p>
    </form>
  );
}
