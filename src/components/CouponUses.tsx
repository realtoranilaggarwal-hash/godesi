import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

/** Confirmed bookings made with a code, newest first, for the coupon lists. */
export const couponTicketsInclude = {
  where: { status: "CONFIRMED" },
  orderBy: { createdAt: "desc" },
  take: 20,
  select: {
    id: true,
    userId: true,
    eventId: true,
    buyerName: true,
    buyerEmail: true,
    quantity: true,
    createdAt: true,
    checkedInAt: true,
    tier: { select: { name: true } },
  },
} satisfies Prisma.Coupon$ticketsArgs;

type CouponTicket = Prisma.TicketGetPayload<{
  select: (typeof couponTicketsInclude)["select"];
}>;

/**
 * The coupon is recorded on the first ticket of a booking only, so add the other ticket
 * types the same buyer booked in that checkout (created together, within a few seconds).
 */
export async function withWholeBookings<T extends { tickets: CouponTicket[] }>(
  coupons: T[],
): Promise<T[]> {
  const anchors = coupons.flatMap((coupon) => coupon.tickets).filter((ticket) => ticket.userId);
  if (!anchors.length) return coupons;
  const window = 5000;
  const siblings = await db.ticket.findMany({
    where: {
      status: "CONFIRMED",
      couponId: null,
      OR: anchors.map((ticket) => ({
        userId: ticket.userId,
        eventId: ticket.eventId,
        createdAt: {
          gte: new Date(ticket.createdAt.getTime() - window),
          lte: new Date(ticket.createdAt.getTime() + window),
        },
      })),
    },
    select: couponTicketsInclude.select,
  });
  return coupons.map((coupon) => ({
    ...coupon,
    tickets: coupon.tickets.flatMap((ticket) => [
      ticket,
      ...siblings.filter(
        (sibling) =>
          sibling.userId === ticket.userId &&
          sibling.eventId === ticket.eventId &&
          Math.abs(sibling.createdAt.getTime() - ticket.createdAt.getTime()) <= window,
      ),
    ]),
  }));
}

const day = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "America/New_York",
  });

/** Who a comp code went to, and which tickets were booked with any code. */
export function CouponUses({
  coupon,
}: {
  coupon: {
    sentToName: string | null;
    sentToEmail: string | null;
    tickets: CouponTicket[];
  };
}) {
  const { tickets } = coupon;
  return (
    <div className="mt-1 space-y-0.5 text-xs text-slate-500">
      {coupon.sentToEmail ? (
        <p>
          🎁 Sent to {coupon.sentToName} ({coupon.sentToEmail}) —{" "}
          {tickets.length ? (
            <span className="font-semibold text-emerald-700">
              booked, tickets issued
            </span>
          ) : (
            <span className="font-semibold text-amber-700">not booked yet</span>
          )}
        </p>
      ) : null}
      {tickets.length ? (
        <ul>
          {tickets.map((ticket) => (
            <li key={ticket.id} className="break-words">
              ✓ {ticket.quantity} × {ticket.tier?.name ?? "ticket"} ·{" "}
              {ticket.buyerName} ({ticket.buyerEmail}) · {day(ticket.createdAt)}
              {ticket.checkedInAt ? " · checked in at the door" : ""}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
