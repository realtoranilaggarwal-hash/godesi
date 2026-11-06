"use client";

import { deleteEventAction } from "@/app/actions/events";

export function DeleteEventButton({ eventId, hasPaidTickets }: { eventId: string; hasPaidTickets: boolean }) {
  const warning = hasPaidTickets
    ? "This event has paid tickets, so it will be hidden (cancelled) instead of deleted. Buyers keep their tickets. Continue?"
    : "Delete this event for good? This can't be undone.";
  return (
    <form
      action={deleteEventAction}
      onSubmit={(e) => {
        if (!window.confirm(warning)) e.preventDefault();
      }}
    >
      <input type="hidden" name="eventId" value={eventId} />
      <button
        type="submit"
        className="rounded-lg border border-rose-300 bg-white px-2 py-1 text-xs font-bold text-rose-700 hover:bg-rose-50"
      >
        🗑️ Delete event
      </button>
    </form>
  );
}
