import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { emailEnabled, sendEmail, ticketEmail } from "@/lib/email";
import { recordCouponUse } from "@/lib/coupons";
import { LEGACY_EVENT_ZONE } from "@/lib/time";

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

/**
 * "EST", "IST" — the zone's own abbreviation. No single locale knows them all:
 * en-US names the American zones and calls Kolkata "GMT+5:30", en-IN the other
 * way round, so each is tried until one gives a name rather than an offset.
 */
function zoneLabel(value: Date, timeZone: string) {
  for (const locale of ["en-US", "en-IN", "en-GB"]) {
    const label = new Intl.DateTimeFormat(locale, {
      timeZone,
      timeZoneName: "short",
    })
      .formatToParts(value)
      .find((part) => part.type === "timeZoneName")?.value;
    if (label && !label.startsWith("GMT") && !label.startsWith("UTC")) {
      return label;
    }
  }
  return new Intl.DateTimeFormat("en-GB", { timeZone, timeZoneName: "short" })
    .formatToParts(value)
    .find((part) => part.type === "timeZoneName")?.value ?? "";
}

/**
 * An event's time is always shown in the town's own zone, with the zone named,
 * so "8:00 pm EST" means the same thing to a reader in Edison and in Delhi.
 */
export function formatEventDate(value: Date, zone?: string | null) {
  const timeZone = zone || LEGACY_EVENT_ZONE;
  const stamp = new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(value);
  return `${stamp} ${zoneLabel(value, timeZone)}`;
}

/**
 * The end of an event: just the time when it finishes the same day, the full
 * date when it runs over into another one. Null when the calendar it came from
 * gave the same minute for both, which reads as "4:00 am – 4:00 am".
 */
export function formatEventEnd(
  startsAt: Date,
  endsAt: Date,
  zone?: string | null,
) {
  if (endsAt.getTime() - startsAt.getTime() < 60_000) return null;
  const timeZone = zone || LEGACY_EVENT_ZONE;
  const day = new Intl.DateTimeFormat("en-CA", { timeZone });
  if (day.format(startsAt) !== day.format(endsAt)) {
    return formatEventDate(endsAt, timeZone);
  }
  const clock = new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(endsAt);
  return `${clock} ${zoneLabel(endsAt, timeZone)}`;
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

    if (current.tierId) {
      await tx.ticketTier.update({
        where: { id: current.tierId },
        data: { seatsBooked: { increment: current.quantity } },
      });
    }

    return tx.ticket.findUniqueOrThrow({ where: { id: current.id } });
  });

  if (ticket.couponId && ticket.discountMinor > 0 && ticket.userId) {
    await recordCouponUse({
      couponId: ticket.couponId,
      userId: ticket.userId,
      amountMinor: ticket.discountMinor,
      currency: ticket.currency,
      reference: `ticket_${ticket.id}`,
    });
  }

  await sendTicketConfirmation(ticket.id);
  return { alreadyProcessed: false as const, ticket };
}

/** Best-effort ticket receipt with the QR code; never blocks the booking. */
async function sendTicketConfirmation(ticketId: string) {
  if (!emailEnabled()) return;
  const ticket = await db.ticket.findUnique({
    where: { id: ticketId },
    include: {
      event: {
        select: {
          title: true,
          startsAt: true,
          timeZone: true,
          venue: true,
          city: true,
        },
      },
    },
  });
  if (!ticket?.buyerEmail) return;

  const { subject, html } = ticketEmail({
    eventTitle: ticket.event.title,
    when: formatEventDate(ticket.event.startsAt, ticket.event.timeZone),
    venue: `${ticket.event.venue}, ${ticket.event.city}`,
    seats: ticket.quantity,
    code: ticket.code,
  });
  await sendEmail({ to: ticket.buyerEmail, subject, html });
}
