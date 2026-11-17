"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { startPartnerPackageCheckout } from "@/app/actions/partnerPackage";
import { emptyState } from "@/lib/actions";
import { Button, Field, inputClass } from "@/components/ui";
import { FormError } from "@/components/forms/FormError";

export type PartnerTierOption = { tier: string; label: string; priceUsd: number };

function PayButton({ price }: { price: number }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full py-3 text-base sm:w-auto">
      {pending ? "Opening secure checkout…" : `💳 Pay $${price.toLocaleString("en-US")} & get started`}
    </Button>
  );
}

export function PartnerPackageForm({
  tiers,
  defaultTier,
}: {
  tiers: PartnerTierOption[];
  defaultTier?: string;
}) {
  const [state, formAction] = useFormState(startPartnerPackageCheckout, emptyState);
  const [tier, setTier] = useState(
    tiers.some((option) => option.tier === defaultTier) ? defaultTier! : tiers[0].tier,
  );
  const selected = tiers.find((option) => option.tier === tier) ?? tiers[0];
  return (
    <form action={formAction} className="space-y-3">
      <FormError>{state.error}</FormError>
      <fieldset className="grid gap-2 sm:grid-cols-2">
        <legend className="mb-1 text-sm font-bold text-slate-800">Choose your package</legend>
        {tiers.map((option) => (
          <label
            key={option.tier}
            className={`flex min-w-0 cursor-pointer items-start gap-2 rounded-xl border-2 p-3 text-sm ${
              option.tier === tier ? "border-amber-500 bg-amber-50" : "border-slate-200 bg-white"
            }`}
          >
            <input
              type="radio"
              name="tier"
              value={option.tier}
              checked={option.tier === tier}
              onChange={() => setTier(option.tier)}
              className="mt-0.5 h-4 w-4 shrink-0"
            />
            <span className="min-w-0 break-words">
              <span className="block font-black text-slate-900">
                ${option.priceUsd.toLocaleString("en-US")}
              </span>
              {option.label}
            </span>
          </label>
        ))}
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Business name" required>
          <input name="business" required className={inputClass} />
        </Field>
        <Field label="Your name" required>
          <input name="name" required className={inputClass} />
        </Field>
        <Field label="Email" required>
          <input name="email" type="email" required className={inputClass} />
        </Field>
        <Field label="Phone" required>
          <input name="phone" type="tel" required className={inputClass} />
        </Field>
        <Field label="Current website or Facebook/Google page" hint="Optional — helps us build your new site.">
          <input name="website" inputMode="url" className={inputClass} />
        </Field>
      </div>
      <PayButton price={selected.priceUsd} />
      <p className="text-xs text-slate-500">Secure card payment by Stripe. No GoDesi account needed.</p>
    </form>
  );
}
