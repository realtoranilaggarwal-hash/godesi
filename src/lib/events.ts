import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { emailEnabled, sendEmail, ticketEmail } from "@/lib/email";

export async function uniqueEventSlug(title: string, city: string) {
  const base = slugify([title, city].filter(Boolean).join(" ")) || "event";
  let candidate = base;
  let counter = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await db.event.findUnique({ where: { slug: candidate } })) {
    counter += 1;
    candidate = `${base}-${counter}`;
  }
  return candidate;
}

/** Human-typable ticket code, e.g. GD-4F7K-9QX2. */
export function ticketCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const raw = randomBytes(8);
  const chars = Array.from(raw, (byte) => alphabet[byte % alphabet.length]);
  return `GD-${chars.slice(0, 4).join("")}-${chars.slice(4, 8).join("")}`;
}

export function seatsLeft(event: { seatsTotal: number; seatsBooked: number }) {
  return Math.max(0, event.seatsTotal - event.seatsBooked);
}

export function isPast(event: { startsAt: Date }) {
  return event.startsAt.getTime() < Date.now();
}

export function formatEventDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(value);
}

/**
 * Confirms a ticket and takes the seats in one transaction. Idempotent on the
 * payment reference, so a Stripe webhook and the success page can both call it.
 */
export async function confirmTicket({
  ticketId,
  provider,
  reference,
  amountMinor,
  currency,
}: {
  ticketId: string;
  provider: string;
  reference: string;
  /** In the currency's minor unit (paise, cents). */
  amountMinor: number;
  currency: string;
}) {
  const existing = await db.ticket.findUnique({ where: { reference } });
  if (existing?.status === "CONFIRMED") {
    return { alreadyProcessed: true as const, ticket: existing };
  }

  const ticket = await db.$transaction(async (tx) => {
    const current = await tx.ticket.findUnique({ where: { id: ticketId } });
    if (!current) throw new Error("Ticket not found");
    if (current.status === "CONFIRMED") return current;

    /**
     * Claim the pending ticket first: concurrent callers (webhook + success page) see
     * 0 updated rows and skip the seat increment, so seats are never counted twice.
     */
    const claimed = await tx.ticket.updateMany({
      where: { id: current.id, status: "PENDING" },
      data: { status: "CONFIRMED", provider, reference, amountMinor, currency },
    });
    if (claimed.count === 0) {
      return tx.ticket.findUniqueOrThrow({ where: { id: current.id } });
    }

    await tx.event.update({
      where: { id: current.eventId },
      data: { seatsBooked: { increment: current.quantity } },
    });

    return tx.ticket.findUniqueOrThrow({ where: { id: current.id } });
  });

  await sendTicketConfirmation(ticket.id);
  return { alreadyProcessed: false as const, ticket };
}

/** Best-effort ticket receipt with the QR code; never blocks the booking. */
async function sendTicketConfirmation(ticketId: string) {
  if (!emailEnabled()) return;
  const ticket = await db.ticket.findUnique({
    where: { id: ticketId },
    include: {
      event: { select: { title: true, startsAt: true, venue: true, city: true } },
    },
  });
  if (!ticket?.buyerEmail) return;

  const { subject, html } = ticketEmail({
    eventTitle: ticket.event.title,
    when: formatEventDate(ticket.event.startsAt),
    venue: `${ticket.event.venue}, ${ticket.event.city}`,
    seats: ticket.quantity,
    code: ticket.code,
  });
  await sendEmail({ to: ticket.buyerEmail, subject, html });
}
