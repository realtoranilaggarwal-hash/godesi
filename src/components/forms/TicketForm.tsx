"use client";

import { useFormState } from "react-dom";
import { bookTicketAction } from "@/app/actions/events";
import { emptyState } from "@/lib/actions";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";

export function TicketForm({
  eventId,
  price,
  seatsLeft,
  maxPerBooking,
  defaultName,
  defaultEmail,
}: {
  eventId: string;
  price: number;
  seatsLeft: number;
  maxPerBooking: number;
  defaultName?: string;
  defaultEmail?: string;
}) {
  const [state, formAction] = useFormState(bookTicketAction, emptyState);

  return (
    <form action={formAction} className="space-y-3">
      {state.error ? <Alert>{state.error}</Alert> : null}
      <input type="hidden" name="eventId" value={eventId} />

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
            max={maxPerBooking}
            defaultValue={1}
            required
            className={inputClass}
          />
        </Field>
      </div>

      <SubmitButton pendingLabel="Booking...">
        {price ? "Book & pay" : "Get free ticket"}
      </SubmitButton>
      <p className="text-xs text-slate-500">
        {seatsLeft} seat(s) left · max {maxPerBooking} per booking
        {price ? " · payment handled securely by Stripe" : ""}
      </p>
    </form>
  );
}
