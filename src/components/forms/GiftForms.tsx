"use client";

import { useFormState } from "react-dom";
import { addGiftAction, redeemGiftCodeAction } from "@/app/actions/scratch";
import { emptyState } from "@/lib/actions";
import { GIFT_CLAIM_LABELS } from "@/lib/scratch";
import { Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/forms/FormError";
import { FormSuccess } from "@/components/forms/FormSuccess";

export function GiftForm() {
  const [state, formAction] = useFormState(addGiftAction, emptyState);
  return (
    <form action={formAction} className="space-y-3">
      <FormError>{state.error}</FormError>
      <FormSuccess>{state.success}</FormSuccess>
      <Field
        label="Free gift"
        required
        hint="e.g. Free mango lassi, 1 free haircut, free consultation"
      >
        <input name="title" required maxLength={80} className={inputClass} />
      </Field>
      <Field label="Details" hint="Optional — limits, which branch, valid days">
        <input name="details" maxLength={400} className={inputClass} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Winner collects it by" required>
          <select
            name="claimHow"
            className={inputClass}
            defaultValue="VISIT_STORE"
          >
            {Object.entries(GIFT_CLAIM_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="How many gifts" required>
          <input
            name="quantity"
            type="number"
            min={1}
            max={500}
            defaultValue={10}
            className={inputClass}
          />
        </Field>
        <Field label="Last day" hint="Optional">
          <input name="expiresAt" type="date" className={inputClass} />
        </Field>
      </div>
      <SubmitButton pendingLabel="Adding...">Offer this gift</SubmitButton>
    </form>
  );
}

export function RedeemCodeForm() {
  const [state, formAction] = useFormState(redeemGiftCodeAction, emptyState);
  return (
    <form action={formAction} className="space-y-2">
      <FormError>{state.error}</FormError>
      <FormSuccess>{state.success}</FormSuccess>
      <div className="flex gap-2">
        <input
          name="code"
          required
          maxLength={12}
          placeholder="Winner's code, e.g. 9F3A12BC"
          className={`${inputClass} font-mono uppercase`}
        />
        <SubmitButton pendingLabel="Checking...">Mark collected</SubmitButton>
      </div>
    </form>
  );
}
