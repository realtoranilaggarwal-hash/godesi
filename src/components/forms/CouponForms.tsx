"use client";

import { useFormState } from "react-dom";
import {
  createCouponAction,
  createEventCouponAction,
} from "@/app/actions/coupons";
import { emptyState } from "@/lib/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { Alert, Field, inputClass } from "@/components/ui";
import { FormError } from "@/components/forms/FormError";

function DiscountFields({ withCurrency }: { withCurrency: boolean }) {
  return (
    <>
      <Field label="Discount type">
        <select
          name="discountKind"
          defaultValue="PERCENT"
          className={inputClass}
        >
          <option value="PERCENT">Percent off</option>
          <option value="FIXED">Fixed amount off</option>
        </select>
      </Field>
      <Field
        label="Amount"
        hint="e.g. 20 for 20% off, or 500 for ₹500 off — leave blank if the code only adds months"
      >
        <input name="amount" type="number" min={0} className={inputClass} />
      </Field>
      {withCurrency ? (
        <Field label="Currency" hint="Used for fixed-amount codes only">
          <select name="currency" defaultValue="USD" className={inputClass}>
            <option value="USD">USD ($)</option>
            <option value="INR">INR (₹)</option>
          </select>
        </Field>
      ) : null}
      <Field label="Total uses" hint="Leave blank for unlimited">
        <input
          name="maxRedemptions"
          type="number"
          min={1}
          className={inputClass}
        />
      </Field>
      <Field label="Expires on" hint="Optional">
        <input name="expiresAt" type="date" className={inputClass} />
      </Field>
    </>
  );
}

/** Admin-only: a platform code you can hand to clients. */
export function CouponForm() {
  const [state, formAction] = useFormState(createCouponAction, emptyState);

  return (
    <form action={formAction} className="space-y-3">
      <FormError>{state.error}</FormError>
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Code" hint="Letters, numbers and dashes">
          <input
            name="code"
            required
            placeholder="WELCOME20"
            className={`${inputClass} uppercase`}
          />
        </Field>
        <Field label="Applies to">
          <select name="scope" defaultValue="PLAN" className={inputClass}>
            <option value="PLAN">Plan upgrades</option>
            <option value="BUNDLE">Complete package</option>
            <option value="ADS">Advertising</option>
            <option value="TICKETS">Event tickets</option>
          </select>
        </Field>
        <Field
          label="Extra months free"
          hint="Package codes only — 48 turns the one-year package into five years"
        >
          <input
            name="bonusMonths"
            type="number"
            min={0}
            max={120}
            defaultValue={0}
            className={inputClass}
          />
        </Field>
        <DiscountFields withCurrency />
        <label className="flex items-start gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            name="publicOffer"
            className="mt-1 h-4 w-4 accent-emerald-600"
          />
          <span>
            Show this code as a flash offer on the upgrade page
            <span className="block text-xs text-slate-500">
              Leave off for caller-only codes. With a use limit it reads “only N
              left at this price”.
            </span>
          </span>
        </label>
      </div>

      <SubmitButton pendingLabel="Creating…">Create coupon</SubmitButton>
    </form>
  );
}

/** Organiser view: a code limited to one of their own events. */
export function EventCouponForm({
  events,
}: {
  events: { id: string; title: string }[];
}) {
  const [state, formAction] = useFormState(createEventCouponAction, emptyState);

  return (
    <form action={formAction} className="space-y-3">
      <FormError>{state.error}</FormError>
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Event">
          <select name="eventId" required className={inputClass}>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Code" hint="Share this with your customers">
          <input
            name="code"
            required
            placeholder="EARLYBIRD"
            className={`${inputClass} uppercase`}
          />
        </Field>
        <DiscountFields withCurrency={false} />
      </div>

      <SubmitButton pendingLabel="Creating…">Create coupon</SubmitButton>
    </form>
  );
}
