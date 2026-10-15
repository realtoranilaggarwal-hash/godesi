import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { can, getCurrentUser } from "@/lib/auth";
import { getCategoryTree } from "@/lib/directory";
import { AdminEventForm } from "@/components/forms/AdminEventForm";
import { venueSuggestions } from "@/lib/venues";
import { LEGACY_EVENT_ZONE, wallClockIn } from "@/lib/time";
import { Card } from "@/components/ui";
import { EDIT_SPEAKERS, speakerDefaults } from "@/lib/eventSpeakers";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Edit your event",
  robots: { index: false },
};

/** The organiser's own edit page: change the picture, text, date, price and links. */
export default async function EditOwnEventPage({
  params,
}: {
  params: { slug: string };
}) {
  const user = await getCurrentUser();
  if (!user)
    redirect(
      `/login?next=${encodeURIComponent(`/events/${params.slug}/edit`)}`,
    );

  const event = await db.event.findUnique({
    where: { slug: params.slug },
    include: {
      category: { select: { slug: true, parentSlug: true } },
      speakers: EDIT_SPEAKERS,
    },
  });
  if (!event || event.sourceId) notFound();
  if (event.organizerId !== user.id) {
    if (can(user, "events")) redirect(`/admin/events/${event.id}`);
    notFound();
  }

  const [categories, venues] = await Promise.all([
    getCategoryTree(),
    venueSuggestions(),
  ]);

  const zone = event.timeZone || LEGACY_EVENT_ZONE;
  const { date, time } = wallClockIn(event.startsAt, zone);
  const end = event.endsAt ? wallClockIn(event.endsAt, zone) : null;
  const parentSlug = event.category?.parentSlug ?? event.category?.slug ?? "";
  const subSlug = event.category?.parentSlug ? event.category.slug : "";

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">✏️ Edit your event</h1>
          <p className="text-sm text-slate-600">
            {event.seatsBooked} booked so far
          </p>
        </div>
        <Link
          href={`/events/${event.slug}`}
          className="text-sm font-semibold text-indigo-600"
        >
          ← Back to the event page
        </Link>
      </div>

      <Card>
        <AdminEventForm
          staff={false}
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
            liveUrl: event.liveUrl ?? "",
            liveTicketOnly: event.liveTicketOnly,
            askReferredBy: event.askReferredBy,
            albumUrl: event.albumUrl ?? "",
            featured: event.featured,
            status: event.status,
            speakers: speakerDefaults(event.speakers),
          }}
        />
      </Card>

      <p className="text-sm text-slate-600">
        🎟️ Ticket types (early bird, couple pass, online seat) are changed on{" "}
        <Link
          href="/dashboard/tickets"
          className="font-semibold text-indigo-600"
        >
          My tickets
        </Link>
        .
      </p>
    </div>
  );
}
