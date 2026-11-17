import type { Prisma } from "@prisma/client";

/** Confirmed bookings made with a code, newest first, for the coupon lists. */
export const couponTicketsInclude = {
  where: { status: "CONFIRMED" },
  orderBy: { createdAt: "desc" },
  take: 20,
  select: {
    id: true,
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
              booked, QR passes emailed
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
