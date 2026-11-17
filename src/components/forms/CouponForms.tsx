"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import {
  createCouponAction,
  createEventCouponAction,
} from "@/app/actions/coupons";
import { emptyState } from "@/lib/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { Field, inputClass } from "@/components/ui";
import { FormError } from "@/components/forms/FormError";
import { FormSuccess } from "@/components/forms/FormSuccess";
import { formatMoney } from "@/lib/format";

export type CouponEventOption = {
  id: string;
  title: string;
  date: string;
  currency: string;
  tiers: { id: string; name: string; price: number }[];
};

/** Admin ticket codes: lock to one event, and optionally to a set number of each ticket type. */
function TicketCouponFields({ events }: { events: CouponEventOption[] }) {
  const [eventId, setEventId] = useState("");
  const event = events.find((item) => item.id === eventId);

  return (
    <>
      <Field
        label="Event"
        hint="Optional — lock the code to one event, like organiser codes"
        className="sm:col-span-2"
      >
        <select
          name="eventId"
          value={eventId}
          onChange={(change) => setEventId(change.target.value)}
          className={inputClass}
        >
          <option value="">Any event</option>
          {events.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title} · {item.date}
            </option>
          ))}
        </select>
      </Field>
      {event?.tiers.length ? (
        <fieldset className="rounded-lg border border-slate-200 p-3 sm:col-span-2">
          <legend className="px-1 text-sm font-medium text-slate-700">
            Only these tickets (optional)
          </legend>
          <p className="mb-2 text-xs text-slate-500">
            Type how many of each ticket the code covers, e.g. Couple 1 + Small
            Kid 1 with 100% off is a comp for exactly that package — anything
            else in the cart is paid. Leave all blank to discount the whole
            order. Fixed-amount codes (e.g. $150 off) also work for a set
            package.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {event.tiers.map((tier) => (
              <label
                key={tier.id}
                className="flex min-w-0 items-center justify-between gap-2 text-sm"
              >
                <span className="min-w-0 break-words">
                  {tier.name}{" "}
                  <span className="text-xs text-slate-400">
                    {formatMoney(tier.price, event.currency)}
                  </span>
                </span>
                <span className="w-20 shrink-0">
                  <input
                    name={`tierMax_${tier.id}`}
                    type="number"
                    min={1}
                    max={10}
                    placeholder="—"
                    aria-label={`${tier.name} tickets covered`}
                    className={inputClass}
                  />
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}
    </>
  );
}

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
        <Field label="Currency" hint="Fixed-amount codes only; event codes use the event's currency">
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
export function CouponForm({
  events = [],
}: {
  events?: CouponEventOption[];
}) {
  const [state, formAction] = useFormState(createCouponAction, emptyState);
  const [scope, setScope] = useState("PLAN");

  return (
    <form action={formAction} className="space-y-3">
      <FormError>{state.error}</FormError>
      <FormSuccess>{state.success}</FormSuccess>

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
          <select
            name="scope"
            value={scope}
            onChange={(change) => setScope(change.target.value)}
            className={inputClass}
          >
            <option value="PLAN">Plan upgrades</option>
            <option value="BUNDLE">Complete package</option>
            <option value="ADS">Advertising</option>
            <option value="TICKETS">Event tickets</option>
            <option value="WEBSITE">Websites (one-time setup fee)</option>
          </select>
        </Field>
        {scope === "TICKETS" ? <TicketCouponFields events={events} /> : null}
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
      <FormSuccess>{state.success}</FormSuccess>

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
