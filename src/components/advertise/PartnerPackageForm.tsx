"use client";

import { useFormState, useFormStatus } from "react-dom";
import { startPartnerPackageCheckout } from "@/app/actions/partnerPackage";
import { emptyState } from "@/lib/actions";
import { Button, Field, inputClass } from "@/components/ui";
import { FormError } from "@/components/forms/FormError";

function PayButton({ price }: { price: number }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full py-3 text-base sm:w-auto">
      {pending ? "Opening secure checkout…" : `💳 Pay $${price} & get started`}
    </Button>
  );
}

export function PartnerPackageForm({ price }: { price: number }) {
  const [state, formAction] = useFormState(startPartnerPackageCheckout, emptyState);
  return (
    <form action={formAction} className="space-y-3">
      <FormError>{state.error}</FormError>
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
      <PayButton price={price} />
      <p className="text-xs text-slate-500">Secure card payment by Stripe. No GoDesi account needed.</p>
    </form>
  );
}
