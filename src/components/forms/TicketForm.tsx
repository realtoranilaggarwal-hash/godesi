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

export function TicketForm({
  eventId,
  price,
  currency,
  seatsLeft,
  maxPerBooking,
  tiers,
  defaultName,
  defaultEmail,
}: {
  eventId: string;
  price: number;
  currency: string;
  seatsLeft: number;
  maxPerBooking: number;
  tiers: TicketTierOption[];
  defaultName?: string;
  defaultEmail?: string;
}) {
  const [state, formAction] = useFormState(bookTicketAction, emptyState);
  const bookable = tiers.filter((tier) => tier.seatsLeft > 0);
  const [tierId, setTierId] = useState(bookable[0]?.id ?? "");

  const selected = bookable.find((tier) => tier.id === tierId);
  const unitPrice = selected ? selected.price : price;
  const available = selected ? selected.seatsLeft : seatsLeft;
  const maxSeats = Math.min(maxPerBooking, available);

  return (
    <form action={formAction} className="space-y-3">
      <FormError>{state.error}</FormError>
      <input type="hidden" name="eventId" value={eventId} />

      {bookable.length ? (
        <Field label="Ticket type">
          <select
            name="tierId"
            value={tierId}
            onChange={(event) => setTierId(event.target.value)}
            className={inputClass}
            required
          >
            {bookable.map((tier) => (
              <option key={tier.id} value={tier.id}>
                {tier.name} —{" "}
                {tier.price ? formatMoney(tier.price, currency) : "Free"} ·{" "}
                {tier.seatsLeft} left
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Your name">
          <input name="buyerName" required defaultValue={defaultName ?? ""} className={inputClass} />
        </Field>
        <Field label="Email">
          <input
            name="buyerEmail"
            type="email"
            required
            defaultValue={defaultEmail ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Phone">
          <input name="buyerPhone" className={inputClass} />
        </Field>
        <Field label="Seats">
          <input
            name="quantity"
            type="number"
            min={1}
            max={maxSeats}
            defaultValue={1}
            required
            className={inputClass}
          />
        </Field>
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

      <SubmitButton pendingLabel="Booking...">
        {unitPrice ? "Book & pay" : "Get free ticket"}
      </SubmitButton>
      <p className="text-xs text-slate-500">
        {available} seat(s) left · max {maxSeats} per booking
        {unitPrice ? ` · ${formatMoney(unitPrice, currency)} per seat` : ""}
        {unitPrice ? " · payment handled securely by Stripe" : ""}
      </p>
    </form>
  );
}
