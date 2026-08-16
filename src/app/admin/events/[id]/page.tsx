import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { getCategoryTree } from "@/lib/directory";
import { AdminEventForm } from "@/components/forms/AdminEventForm";
import { Card, inputClass } from "@/components/ui";
import { reviewPartnerAction } from "@/app/actions/events";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit event" };

/** Renders the IST wall-clock date/time the organiser originally entered. */
function istParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}:${get("minute")}`,
  };
}

export default async function AdminEditEventPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isStaff(user)) redirect("/dashboard");

  const [event, categories] = await Promise.all([
    db.event.findUnique({
      where: { id: params.id },
      include: {
        organizer: { select: { email: true, name: true } },
        category: { select: { slug: true, parentSlug: true } },
        _count: { select: { tickets: true } },
      },
    }),
    getCategoryTree(),
  ]);
  if (!event) notFound();

  const { date, time } = istParts(event.startsAt);
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
          event={{
            id: event.id,
            title: event.title,
            description: event.description,
            date,
            time,
            venue: event.venue,
            city: event.city,
            categorySlug: parentSlug,
            subcategorySlug: subSlug,
            eventType: event.eventType ?? "",
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
