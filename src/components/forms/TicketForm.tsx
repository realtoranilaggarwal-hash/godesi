"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { bookTicketAction } from "@/app/actions/events";
import { emptyState } from "@/lib/actions";
import { formatMoney } from "@/lib/format";
import { Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/forms/FormError";

export type TicketTierOption = {
  id: string;
  name: string;
  price: number;
  seatsLeft: number;
};

/** A ticket-shaped option: price stub on the left, perforation, name and seats on the right. */
function TicketStub({
  name,
  price,
  currency,
  seatsLeft,
  selected,
}: {
  name: string;
  price: number;
  currency: string;
  seatsLeft: number;
  selected: boolean;
}) {
  return (
    <span
      className={`relative flex min-w-0 overflow-hidden rounded-xl border-2 transition ${
        selected
          ? "border-indigo-600 bg-indigo-50 shadow-md"
          : "border-slate-200 bg-white hover:border-indigo-300"
      }`}
    >
      <span
        className={`flex w-24 shrink-0 flex-col items-center justify-center px-2 py-3 text-center ${
          selected ? "bg-indigo-600 text-white" : "bg-amber-100 text-amber-900"
        }`}
      >
        <span className="text-xl" aria-hidden>
          🎟️
        </span>
        <span className="text-sm font-black leading-tight">
          {price ? formatMoney(price, currency) : "FREE"}
        </span>
      </span>
      <span
        className="relative w-0 border-l-2 border-dashed border-slate-300"
        aria-hidden
      >
        <span className="absolute -left-2 -top-2 h-4 w-4 rounded-full border-2 border-slate-200 bg-white" />
        <span className="absolute -bottom-2 -left-2 h-4 w-4 rounded-full border-2 border-slate-200 bg-white" />
      </span>
      <span className="flex min-w-0 flex-1 items-center justify-between gap-2 px-3 py-3">
        <span className="min-w-0">
          <span className="block break-words font-bold text-slate-900">
            {name}
          </span>
          <span className="block text-xs text-slate-500">
            {seatsLeft} ticket{seatsLeft === 1 ? "" : "s"} left
          </span>
        </span>
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-black ${
            selected
              ? "border-indigo-600 bg-indigo-600 text-white"
              : "border-slate-300 text-transparent"
          }`}
          aria-hidden
        >
          ✓
        </span>
      </span>
    </span>
  );
}

export function TicketForm({
  eventId,
  price,
  currency,
  seatsLeft,
  maxPerBooking,
  tiers,
  defaultName,
  defaultEmail,
  askReferredBy = false,
}: {
  eventId: string;
  price: number;
  currency: string;
  seatsLeft: number;
  maxPerBooking: number;
  tiers: TicketTierOption[];
  defaultName?: string;
  defaultEmail?: string;
  askReferredBy?: boolean;
}) {
  const [state, formAction] = useFormState(bookTicketAction, emptyState);
  const bookable = tiers.filter((tier) => tier.seatsLeft > 0);
  const [tierId, setTierId] = useState(bookable[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [email, setEmail] = useState(defaultEmail ?? "");

  const selected = bookable.find((tier) => tier.id === tierId);
  const unitPrice = selected ? selected.price : price;
  const available = selected ? selected.seatsLeft : seatsLeft;
  const maxSeats = Math.max(1, Math.min(maxPerBooking, available));
  const count = Math.min(Math.max(1, quantity || 1), maxSeats);
  const total = unitPrice * count;
  const ticketWord = `ticket${count === 1 ? "" : "s"}`;

  return (
    <form action={formAction} className="space-y-4">
      <FormError>{state.error}</FormError>
      <input type="hidden" name="eventId" value={eventId} />

      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-semibold text-slate-700">
          1. Pick your ticket
        </legend>
        {bookable.length ? (
          bookable.map((tier) => (
            <label key={tier.id} className="block cursor-pointer">
              <input
                type="radio"
                name="tierId"
                value={tier.id}
                checked={tier.id === tierId}
                onChange={() => setTierId(tier.id)}
                className="sr-only"
                required
              />
              <TicketStub
                name={tier.name}
                price={tier.price}
                currency={currency}
                seatsLeft={tier.seatsLeft}
                selected={tier.id === tierId}
              />
            </label>
          ))
        ) : (
          <TicketStub
            name="General admission"
            price={price}
            currency={currency}
            seatsLeft={seatsLeft}
            selected
          />
        )}
      </fieldset>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">
          2. How many tickets?
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, count - 1))}
            disabled={count <= 1}
            className="h-10 w-10 rounded-lg border border-slate-300 text-lg font-bold disabled:opacity-40"
            aria-label="One less ticket"
          >
            −
          </button>
          <input
            name="quantity"
            type="number"
            min={1}
            max={maxSeats}
            value={count}
            onChange={(event) => setQuantity(Number(event.target.value))}
            required
            className={`${inputClass} w-20 text-center`}
            aria-label="Number of tickets"
          />
          <button
            type="button"
            onClick={() => setQuantity(Math.min(maxSeats, count + 1))}
            disabled={count >= maxSeats}
            className="h-10 w-10 rounded-lg border border-slate-300 text-lg font-bold disabled:opacity-40"
            aria-label="One more ticket"
          >
            +
          </button>
          <span className="text-xs text-slate-500">max {maxSeats}</span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">
          3. Where should we send your tickets?
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Your name">
            <input
              name="buyerName"
              required
              defaultValue={defaultName ?? ""}
              className={inputClass}
            />
          </Field>
          <Field label="Email (your tickets go here)">
            <input
              name="buyerEmail"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Phone" hint="Optional">
            <input name="buyerPhone" className={inputClass} />
          </Field>
          {askReferredBy ? (
            <Field
              label="Referred by"
              hint="Optional — who invited you? The organiser sees this."
            >
              <input
                name="referredBy"
                maxLength={120}
                placeholder="Name of the person or group"
                className={inputClass}
              />
            </Field>
          ) : null}
          {unitPrice ? (
            <Field label="Coupon code" hint="Optional — from the organiser">
              <input
                name="couponCode"
                placeholder="e.g. EARLYBIRD"
                className={`${inputClass} uppercase`}
              />
            </Field>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-slate-600">
            {count} × {selected?.name ?? "ticket"}
            {unitPrice ? ` @ ${formatMoney(unitPrice, currency)}` : ""}
          </span>
          <span className="text-lg font-black text-slate-900">
            {unitPrice ? formatMoney(total, currency) : "Free"}
          </span>
        </div>
        {unitPrice ? (
          <p className="mt-1 text-xs text-slate-500">
            Coupon discounts are taken off on the payment page.
          </p>
        ) : null}
      </div>

      <SubmitButton
        pendingLabel={unitPrice ? "Opening payment..." : "Getting your tickets..."}
      >
        {unitPrice
          ? `🎟️ Buy ${count} ${ticketWord} — ${formatMoney(total, currency)}`
          : `🎟️ Get ${count} free ${ticketWord}`}
      </SubmitButton>

      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
        <p className="font-bold">What you get</p>
        <ol className="mt-1 list-decimal space-y-0.5 pl-5">
          {unitPrice ? (
            <li>Pay safely by card on the secure Stripe page.</li>
          ) : null}
          <li>Your ticket with a QR code opens right away.</li>
          <li>
            We email it to{" "}
            <span className="break-all font-semibold">
              {email || "your email"}
            </span>
            .
          </li>
          <li>Show the QR code at the entrance, on your phone or printed.</li>
          <li>Find it any time under My tickets on your GoDesi account.</li>
        </ol>
      </div>
    </form>
  );
}
