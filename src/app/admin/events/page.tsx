import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  savePartnerKitAction,
  setEventStatusAction,
  toggleEventFeaturedAction,
} from "@/app/actions/admin";
import { formatEventDate } from "@/lib/events";
import { Badge, Card, inputClass } from "@/components/ui";
import { deskFallback } from "@/lib/adminSections";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Events" };

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/events-desk");
  if (user.role !== "ADMIN")
    redirect(deskFallback(user, "Events"));

  const kit = await db.partnerKit.findUnique({ where: { id: "default" } });
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
      <Card>
        <h2 className="mb-1 text-lg font-bold">Standee &amp; banner kit</h2>
        <p className="mb-3 text-sm text-slate-600">
          What organisers download from{" "}
          <Link href="/events/partner" className="font-semibold text-indigo-600">
            /events/partner
          </Link>{" "}
          when they take the “standee at the venue, featured for free” deal.
          Paste the file links — the page hides any box you leave empty.
        </p>
        <form action={savePartnerKitAction} className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-semibold text-slate-700">Standee PDF</span>
            <input
              name="standeePdfUrl"
              type="url"
              defaultValue={kit?.standeePdfUrl ?? ""}
              placeholder="https://…/godesi-standee.pdf"
              className={inputClass}
            />
          </label>
          <label className="block text-sm">
            <span className="font-semibold text-slate-700">Printer link</span>
            <input
              name="printerUrl"
              type="url"
              defaultValue={kit?.printerUrl ?? ""}
              placeholder="https://www.ebay.com/itm/…"
              className={inputClass}
            />
          </label>
          <label className="block text-sm">
            <span className="font-semibold text-slate-700">Banner 160×600</span>
            <input
              name="banner160Url"
              type="url"
              defaultValue={kit?.banner160Url ?? ""}
              className={inputClass}
            />
          </label>
          <label className="block text-sm">
            <span className="font-semibold text-slate-700">Banner 728×90</span>
            <input
              name="banner728Url"
              type="url"
              defaultValue={kit?.banner728Url ?? ""}
              className={inputClass}
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-semibold text-slate-700">
              Note for organisers
            </span>
            <input
              name="note"
              defaultValue={kit?.note ?? ""}
              placeholder="Print at A1 on foam board; ask for matte finish."
              className={inputClass}
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Save the kit
            </button>
          </div>
        </form>
      </Card>

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
                    {formatEventDate(event.startsAt, event.timeZone)} · {event.city} ·{" "}
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
                  <form action={toggleEventFeaturedAction}>
                    <input type="hidden" name="id" value={event.id} />
                    <input
                      type="hidden"
                      name="featured"
                      value={event.featured ? "0" : "1"}
                    />
                    <button
                      type="submit"
                      className={`rounded-lg border px-2 py-1 text-xs font-semibold ${
                        event.featured
                          ? "border-amber-400 bg-amber-50 text-amber-700"
                          : "border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {event.featured ? "★ featured" : "☆ feature"}
                    </button>
                  </form>
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
