import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatMinor } from "@/lib/format";
import { formatEventDate, seatsLeft } from "@/lib/events";
import { cancelEventAction } from "@/app/actions/events";
import { Badge, Card, EmptyState, LinkButton } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My tickets & events" };

export default async function MyTicketsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/tickets");

  const [tickets, events] = await Promise.all([
    db.ticket.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { event: { select: {
            title: true,
            slug: true,
            startsAt: true,
            timeZone: true,
            city: true,
          } } },
    }),
    db.event.findMany({
      where: { organizerId: user.id },
      orderBy: { startsAt: "desc" },
      include: { _count: { select: { tickets: true } } },
    }),
  ]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">My tickets & events 🎟️</h1>
        <LinkButton href="/events/new">Post an event</LinkButton>
      </div>

      <Card>
        <h2 className="mb-3 text-lg font-bold">Tickets you booked</h2>
        {tickets.length ? (
          <ul className="divide-y divide-slate-100">
            {tickets.map((ticket) => (
              <li key={ticket.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium">{ticket.event.title}</p>
                  <p className="text-sm text-slate-500">
                    {formatEventDate(ticket.event.startsAt, ticket.event.timeZone)} · {ticket.event.city} ·{" "}
                    {ticket.quantity} seat(s) ·{" "}
                    {ticket.amountMinor ? formatMinor(ticket.amountMinor, ticket.currency) : "Free"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={ticket.status === "CONFIRMED" ? "green" : "amber"}>
                    {ticket.status}
                  </Badge>
                  <Link
                    href={`/tickets/${ticket.code}`}
                    className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-semibold hover:bg-slate-50"
                  >
                    View QR
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No tickets yet" body="Browse events and book your first seat." />
        )}
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-bold">Events you organise</h2>
        {events.length ? (
          <ul className="divide-y divide-slate-100">
            {events.map((event) => (
              <li key={event.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <Link href={`/events/${event.slug}`} className="font-medium text-indigo-600">
                    {event.title}
                  </Link>
                  <p className="text-sm text-slate-500">
                    {formatEventDate(event.startsAt, event.timeZone)} · {event.seatsBooked}/{event.seatsTotal}{" "}
                    booked · {seatsLeft(event)} left · {event._count.tickets} bookings
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    tone={
                      event.status === "APPROVED"
                        ? "green"
                        : event.status === "PENDING"
                          ? "amber"
                          : "red"
                    }
                  >
                    {event.status}
                  </Badge>
                  {event.status !== "REJECTED" ? (
                    <form action={cancelEventAction}>
                      <input type="hidden" name="id" value={event.id} />
                      <button
                        type="submit"
                        className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-semibold hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No events yet" body="Publishing an event is free." />
        )}
      </Card>
    </div>
  );
}
