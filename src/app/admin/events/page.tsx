import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { setEventStatusAction } from "@/app/actions/admin";
import { formatEventDate } from "@/lib/events";
import { Badge, Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Events" };

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/events-desk");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const events = await db.event.findMany({
    orderBy: { startsAt: "desc" },
    take: 30,
    include: {
      organizer: { select: { email: true } },
      _count: { select: { tickets: true } },
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Events</h1>
      <Card id="events">
        <h2 className="mb-3 text-lg font-bold">Events</h2>
        {events.length ? (
          <ul className="divide-y divide-slate-100 text-sm">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2"
              >
                <div>
                  <Link
                    href={`/events/${event.slug}`}
                    className="font-medium text-indigo-600"
                  >
                    {event.title}
                  </Link>
                  <div className="text-xs text-slate-500">
                    {formatEventDate(event.startsAt)} · {event.city} ·{" "}
                    {event.organizer.email} · {event.seatsBooked}/
                    {event.seatsTotal} seats · {event._count.tickets} bookings
                  </div>
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
                  <Link
                    href={`/admin/events/${event.id}`}
                    className="rounded-lg border border-indigo-200 px-2 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                  >
                    edit
                  </Link>
                  {(["APPROVED", "REJECTED"] as const)
                    .filter((status) => status !== event.status)
                    .map((status) => (
                      <form key={status} action={setEventStatusAction}>
                        <input type="hidden" name="id" value={event.id} />
                        <input type="hidden" name="status" value={status} />
                        <button
                          type="submit"
                          className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold hover:bg-slate-50"
                        >
                          {status.toLowerCase()}
                        </button>
                      </form>
                    ))}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No events posted yet.</p>
        )}
      </Card>
    </div>
  );
}
