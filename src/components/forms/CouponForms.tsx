"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import {
  type CompTicketState,
  createCouponAction,
  createEventCouponAction,
  sendCompTicketsAction,
} from "@/app/actions/coupons";
import { emptyState } from "@/lib/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { Field, inputClass } from "@/components/ui";
import { FormError } from "@/components/forms/FormError";
import { FormSuccess } from "@/components/forms/FormSuccess";

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
          <select name="scope" defaultValue="PLAN" className={inputClass}>
            <option value="PLAN">Plan upgrades</option>
            <option value="BUNDLE">Complete package</option>
            <option value="ADS">Advertising</option>
            <option value="TICKETS">Event tickets</option>
            <option value="WEBSITE">Websites (one-time setup fee)</option>
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

export type CompEvent = {
  id: string;
  title: string;
  currency: string;
  /** Without ticket types the event sells one "Ticket" at its base price. */
  tiers: { id: string | null; name: string; price: number; onSale: boolean }[];
};

const money = (value: number, currency: string) =>
  new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);

/** Organiser/admin: a one-use $0 code for chosen tickets, emailed to the buyer. */
export function CompTicketForm({ events }: { events: CompEvent[] }) {
  const [state, formAction] = useFormState<CompTicketState, FormData>(
    sendCompTicketsAction,
    {},
  );
  const [eventId, setEventId] = useState(events[0]?.id ?? "");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const event = events.find((item) => item.id === eventId) ?? events[0];
  const total = event
    ? event.tiers.reduce(
        (sum, tier) => sum + tier.price * (quantities[tier.id ?? "base"] ?? 0),
        0,
      )
    : 0;

  return (
    <form action={formAction} className="space-y-3">
      {state.code ? (
        <div
          className={`rounded-xl border p-3 text-sm ${
            state.emailed
              ? "border-green-200 bg-green-50 text-green-900"
              : "border-amber-300 bg-amber-50 text-amber-900"
          }`}
          role="status"
        >
          <p className="font-semibold">
            {state.emailed
              ? `✅ Emailed to ${state.buyerEmail}`
              : `⚠️ Email to ${state.buyerEmail} not sent — share the code yourself`}
          </p>
          <p className="mt-1">
            Code:{" "}
            <span className="select-all font-mono text-lg font-bold">
              {state.code}
            </span>
          </p>
          <p className="mt-1 break-words">
            For {state.items}. The buyer logs in, opens the event, selects these
            tickets and enters the code at checkout — nothing to pay.
          </p>
        </div>
      ) : (
        <FormError>{state.error}</FormError>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Event">
          <select
            name="eventId"
            required
            value={event?.id ?? ""}
            onChange={(change) => {
              setEventId(change.target.value);
              setQuantities({});
            }}
            className={inputClass}
          >
            {events.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </Field>
        <div className="hidden sm:block" />
        <Field label="Buyer name">
          <input
            name="buyerName"
            required
            minLength={2}
            className={inputClass}
          />
        </Field>
        <Field label="Buyer email" hint="The code is emailed here">
          <input
            name="buyerEmail"
            type="email"
            required
            className={inputClass}
          />
        </Field>
      </div>

      {event ? (
        <fieldset key={event.id} className="space-y-2">
          <legend className="mb-1 text-sm font-semibold">
            Tickets to send
          </legend>
          {event.tiers.map((tier) => {
            const key = tier.id ?? "base";
            return (
              <label
                key={key}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <span className="min-w-0 flex-1 break-words">
                  <span className="font-semibold">{tier.name}</span>{" "}
                  <span className="text-slate-500">
                    {money(tier.price, event.currency)}
                    {tier.onSale ? "" : " · not on sale now"}
                  </span>
                </span>
                <span className="w-20 shrink-0">
                  <input
                    name={`qty_${key}`}
                    type="number"
                    min={0}
                    max={10}
                    inputMode="numeric"
                    disabled={!tier.onSale}
                    value={quantities[key] ?? 0}
                    onChange={(change) =>
                      setQuantities((current) => ({
                        ...current,
                        [key]: Math.max(0, Number(change.target.value) || 0),
                      }))
                    }
                    className={inputClass}
                  />
                </span>
              </label>
            );
          })}
          <p className="text-sm">
            Code value: <strong>{money(total, event.currency)}</strong>
          </p>
        </fieldset>
      ) : null}

      <p className="text-xs text-slate-500">
        The code works once, only for this event, and only when the order holds
        at least these tickets; it takes off exactly their price, so extra
        tickets are paid for. Seats are not held — the buyer books them like
        anyone else.
      </p>

      <SubmitButton pendingLabel="Sending…">
        Create code &amp; email buyer
      </SubmitButton>
    </form>
  );
}
