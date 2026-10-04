"use client";

import { useFormState } from "react-dom";
import { addDealAction } from "@/app/actions/deals";
import { emptyState } from "@/lib/actions";
import { Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/forms/FormError";
import { FormSuccess } from "@/components/forms/FormSuccess";
import { CouponTips } from "@/components/CouponTips";

export function DealForm() {
  const [state, formAction] = useFormState(addDealAction, emptyState);

  return (
    <form action={formAction} className="space-y-3">
      <FormError>{state.error}</FormError>
      <FormSuccess>{state.success}</FormSuccess>
      <CouponTips kind="business" />

      <Field
        label="Offer headline"
        required
        hint="e.g. 15% off catering for GoDesi members"
      >
        <input name="title" required maxLength={90} className={inputClass} />
      </Field>
      <Field
        label="Details and terms"
        hint="Who it's for, minimum order, how to claim"
      >
        <textarea
          name="details"
          rows={3}
          maxLength={600}
          placeholder="Mention GoDesi when you book. Orders over $200, NJ only."
          className={inputClass}
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Promo code" hint="Optional — customers quote it">
          <input
            name="code"
            maxLength={24}
            placeholder="GODESI15"
            className={`${inputClass} uppercase`}
          />
        </Field>
        <Field label="Last day" hint="Optional — blank runs until you pause it">
          <input name="expiresAt" type="date" className={inputClass} />
        </Field>
        <Field label="Link to claim it" hint="Optional, e.g. your booking page">
          <input
            name="linkUrl"
            type="url"
            placeholder="https://"
            className={inputClass}
          />
        </Field>
      </div>
      <SubmitButton pendingLabel="Posting...">Post deal</SubmitButton>
    </form>
  );
}
