import { db } from "@/lib/db";

export function eventAttendees(eventId: string) {
  return db.ticket.findMany({
    where: { eventId, status: "CONFIRMED" },
    orderBy: { createdAt: "asc" },
    select: {
      code: true,
      buyerName: true,
      buyerEmail: true,
      buyerPhone: true,
      referredBy: true,
      quantity: true,
      amountMinor: true,
      currency: true,
      checkedInAt: true,
      createdAt: true,
      tier: { select: { name: true } },
    },
  });
}

export type EventAttendee = Awaited<ReturnType<typeof eventAttendees>>[number];

/** Seats booked per referrer, most first; blank answers are left out. */
export function referralTally(rows: EventAttendee[]) {
  const counts = new Map<string, { name: string; seats: number }>();
  for (const row of rows) {
    const name = row.referredBy?.trim();
    if (!name) continue;
    const key = name.toLowerCase().replace(/\s+/g, " ");
    const entry = counts.get(key) ?? { name, seats: 0 };
    entry.seats += row.quantity;
    counts.set(key, entry);
  }
  return Array.from(counts.values()).sort((a, b) => b.seats - a.seats);
}
