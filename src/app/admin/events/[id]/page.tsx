import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { can, getCurrentUser, isStaff } from "@/lib/auth";
import { deskFallback } from "@/lib/adminSections";
import { getCategoryTree } from "@/lib/directory";
import { AdminEventForm } from "@/components/forms/AdminEventForm";
import { venueSuggestions } from "@/lib/venues";
import { TicketTypesForm } from "@/components/forms/TicketTypesForm";
import { LEGACY_EVENT_ZONE, wallClockIn } from "@/lib/time";
import { Card, inputClass } from "@/components/ui";
import { reviewPartnerAction } from "@/app/actions/events";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit event" };

export default async function AdminEditEventPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isStaff(user)) redirect("/dashboard");
  // The ticket-type and partner actions all need the events permission, so a
  // moderator without it was shown forms every submit refused.
  if (!can(user, "events")) redirect(deskFallback(user, "Edit event"));

  const [event, categories, venues] = await Promise.all([
    db.event.findUnique({
      where: { id: params.id },
      include: {
        organizer: { select: { email: true, name: true } },
        category: { select: { slug: true, parentSlug: true } },
        tiers: {
          orderBy: [{ sortOrder: "asc" }, { price: "asc" }],
          select: {
            id: true,
            name: true,
            price: true,
            seatsTotal: true,
            seatsBooked: true,
          },
        },
        _count: { select: { tickets: true } },
      },
    }),
    getCategoryTree(),
    venueSuggestions(),
  ]);
  if (!event) notFound();

  // The form shows the times as the event's own town states them.
  const zone = event.timeZone || LEGACY_EVENT_ZONE;
  const { date, time } = wallClockIn(event.startsAt, zone);
  const end = event.endsAt ? wallClockIn(event.endsAt, zone) : null;
  const parentSlug = event.category?.parentSlug ?? event.category?.slug ?? "";
  const subSlug = event.category?.parentSlug ? event.category.slug : "";

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Edit event</h1>
          <p className="text-sm text-slate-600">
            Organiser {event.organizer.name} ({event.organizer.email}) ·{" "}
            {event._count.tickets} bookings · {event.seatsBooked}/
            {event.seatsTotal} seats
          </p>
        </div>
        <div className="flex gap-3 text-sm font-semibold text-indigo-600">
          <Link href={`/events/${event.slug}`}>View public page</Link>
          <Link href="/admin">Back to admin</Link>
        </div>
      </div>

      <Card>
        <AdminEventForm
          categories={categories}
          venues={venues}
          event={{
            id: event.id,
            title: event.title,
            description: event.description,
            date,
            time,
            endDate: end?.date ?? "",
            endTime: end?.time ?? "",
            timeZone: zone,
            venue: event.venue,
            hallName: event.hallName ?? "",
            hallCapacity: event.hallCapacity,
            venueUrl: event.venueUrl ?? "",
            city: event.city,
            frequency: event.frequency,
            recurrence: event.recurrence ?? "",
            categorySlug: parentSlug,
            subcategorySlug: subSlug,
            eventType: event.eventType ?? "",
            mode: event.mode,
            onlineUrl: event.onlineUrl ?? "",
            genres: event.genres,
            languages: event.languages,
            websiteUrl: event.websiteUrl ?? "",
            price: event.price,
            currency: event.currency,
            seatsTotal: event.seatsTotal,
            seatsBooked: event.seatsBooked,
            imageUrl: event.imageUrl ?? "",
            videoUrl: event.videoUrl ?? "",
            albumUrl: event.albumUrl ?? "",
            featured: event.featured,
            status: event.status,
          }}
        />
      </Card>

      <Card>
        <h2 className="font-bold">🎟️ Ticket types</h2>
        <p className="text-sm text-slate-600">
          Early bird, couple pass, online seat — each with its own price and
          seats. Price a type at 0 and it becomes a free RSVP. With no types at
          all, the single price and seat count above are used.
        </p>
        <TicketTypesForm
          eventId={event.id}
          currency={event.currency}
          tiers={event.tiers}
        />
      </Card>

      {event.partnerStatus === "NONE" ? null : (
        <Card>
          <h2 className="font-bold">🤝 Godesi promotion partnership</h2>
          <p className="text-sm text-slate-600">
            Status: <strong>{event.partnerStatus}</strong>
            {event.partnerAgreedAt
              ? ` · organiser agreed ${event.partnerAgreedAt.toLocaleDateString()}`
              : ""}
            {event.partnerProofAt
              ? ` · proof uploaded ${event.partnerProofAt.toLocaleDateString()}`
              : " · no proof uploaded yet"}
          </p>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Banner", url: event.partnerBannerUrl },
              { label: "Standee", url: event.partnerStandeeUrl },
              { label: "Ticket sales", url: event.partnerSalesUrl },
            ].map((proof) => (
              <div key={proof.label}>
                <p className="text-xs font-bold uppercase text-slate-500">
                  {proof.label}
                </p>
                {proof.url ? (
                  <a href={proof.url} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={proof.url}
                      alt={`${proof.label} proof`}
                      className="mt-1 h-24 w-full rounded-xl border border-slate-200 object-cover"
                    />
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-slate-400">Not uploaded</p>
                )}
              </div>
            ))}
          </div>

          <form action={reviewPartnerAction} className="mt-3 space-y-2">
            <input type="hidden" name="id" value={event.id} />
            <input
              name="partnerNote"
              defaultValue={event.partnerNote ?? ""}
              placeholder="Internal note (optional)"
              className={inputClass}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                name="decision"
                value="APPROVED"
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
              >
                Approve — feature &amp; promote
              </button>
              <button
                type="submit"
                name="decision"
                value="REJECTED"
                className="rounded-xl border border-red-300 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-50"
              >
                Reject
              </button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
