"use client";

import { useFormState } from "react-dom";
import {
  removeTicketTypeAction,
  saveTicketTypeAction,
} from "@/app/actions/events";
import { emptyState } from "@/lib/actions";
import { Alert, inputClass } from "@/components/ui";

export type TicketTypeRow = {
  id: string;
  name: string;
  price: number;
  seatsTotal: number;
  seatsBooked: number;
};

/**
 * Ticket types on an event that is already live: an organiser adds a second
 * batch, an online seat or a free RSVP row here rather than reposting.
 */
export function TicketTypesForm({
  eventId,
  currency,
  tiers,
}: {
  eventId: string;
  currency: string;
  tiers: TicketTypeRow[];
}) {
  const [saved, save] = useFormState(saveTicketTypeAction, emptyState);
  const [removed, remove] = useFormState(removeTicketTypeAction, emptyState);
  const state = saved.error || saved.success ? saved : removed;

  return (
    <div className="mt-3 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-sm font-bold text-slate-900">
        Ticket types{" "}
        <span className="font-normal text-slate-500">
          (price in {currency}; 0 = free RSVP seat)
        </span>
      </p>

      {state.error ? <Alert tone="error">{state.error}</Alert> : null}
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      {tiers.map((tier) => (
        <div key={tier.id} className="flex flex-wrap items-end gap-2">
          <form action={save} className="flex flex-wrap items-end gap-2">
            <input type="hidden" name="eventId" value={eventId} />
            <input type="hidden" name="tierId" value={tier.id} />
            <input
              name="name"
              defaultValue={tier.name}
              aria-label="Ticket type name"
              className={`${inputClass} w-40`}
            />
            <input
              name="price"
              type="number"
              min={0}
              defaultValue={tier.price}
              aria-label="Price"
              className={`${inputClass} w-24`}
            />
            <input
              name="seatsTotal"
              type="number"
              min={1}
              defaultValue={tier.seatsTotal}
              aria-label="Seats"
              className={`${inputClass} w-24`}
            />
            <button
              type="submit"
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Save
            </button>
          </form>
          <span className="text-xs text-slate-500">
            {tier.seatsBooked}/{tier.seatsTotal} booked
          </span>
          {tier.seatsBooked === 0 ? (
            <form action={remove}>
              <input type="hidden" name="eventId" value={eventId} />
              <input type="hidden" name="tierId" value={tier.id} />
              <button
                type="submit"
                className="text-xs font-semibold text-rose-600 hover:underline"
              >
                Remove
              </button>
            </form>
          ) : null}
        </div>
      ))}

      <form
        action={save}
        key={saved.success ?? "new"}
        className="flex flex-wrap items-end gap-2"
      >
        <input type="hidden" name="eventId" value={eventId} />
        <input
          name="name"
          placeholder="New type — e.g. Online seat"
          aria-label="New ticket type name"
          className={`${inputClass} w-40`}
        />
        <input
          name="price"
          type="number"
          min={0}
          placeholder="Price"
          aria-label="New ticket type price"
          className={`${inputClass} w-24`}
        />
        <input
          name="seatsTotal"
          type="number"
          min={1}
          placeholder="Seats"
          aria-label="New ticket type seats"
          className={`${inputClass} w-24`}
        />
        <button
          type="submit"
          className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          + Add ticket type
        </button>
      </form>
    </div>
  );
}
