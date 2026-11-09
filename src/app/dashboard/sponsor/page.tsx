import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  requestSponsorAction,
  setSponsorOptInAction,
} from "@/app/actions/sponsors";
import { Alert, Card, LinkButton, inputClass } from "@/components/ui";
import { formatEventDate } from "@/lib/events";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Sponsor local events",
  robots: { index: false },
};

export default async function SponsorEventsPage({
  searchParams,
}: {
  searchParams: { sent?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/sponsor");
  const business = await db.business.findUnique({
    where: { ownerId: user.id },
  });

  if (!business) {
    return (
      <Card className="mx-auto max-w-2xl space-y-3">
        <h1 className="text-2xl font-bold">🤝 Sponsor local events</h1>
        <p className="text-sm text-slate-600">
          Make your free GoDesi business card first. Your logo or photo is what
          shows on the event page once the organiser approves you.
        </p>
        <LinkButton href="/dashboard/profile">
          Create my business card
        </LinkButton>
      </Card>
    );
  }

  const [events, requests] = await Promise.all([
    business.sponsorsEvents
      ? db.event.findMany({
          where: {
            status: "APPROVED",
            startsAt: { gte: new Date() },
            mode: { not: "ONLINE" },
            OR: [
              { city: { equals: business.city, mode: "insensitive" } },
              ...(business.state
                ? [
                    {
                      state: {
                        equals: business.state,
                        mode: "insensitive" as const,
                      },
                    },
                  ]
                : []),
            ],
          },
          orderBy: { startsAt: "asc" },
          take: 40,
          select: {
            id: true,
            slug: true,
            title: true,
            startsAt: true,
            timeZone: true,
            venue: true,
            city: true,
            imageUrl: true,
          },
        })
      : Promise.resolve([]),
    db.eventSponsor.findMany({
      where: { businessId: business.id },
      select: { eventId: true, status: true },
    }),
  ]);
  const statusFor = new Map(requests.map((r) => [r.eventId, r.status]));

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">🤝 Sponsor local events</h1>
      {searchParams.sent ? (
        <Alert tone="success">
          Sent! The organiser got an email and can approve you from their event
          page. Once approved, your photo and offer show there.
        </Alert>
      ) : null}
      <Card>
        <form action={setSponsorOptInAction} className="space-y-3">
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              name="sponsorsEvents"
              defaultChecked={business.sponsorsEvents}
              className="mt-1 h-5 w-5"
            />
            <span>
              <b>Yes, {business.name} would like to sponsor events</b>
              <br />
              <span className="text-slate-600">
                See upcoming events near {business.city} and ask their
                organisers to partner with you.
              </span>
            </span>
          </label>
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700"
          >
            Save
          </button>
        </form>
      </Card>

      {business.sponsorsEvents ? (
        events.length ? (
          <ul className="space-y-3">
            {events.map((event) => {
              const status = statusFor.get(event.id);
              return (
                <li key={event.id}>
                  <Card className="space-y-2">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <Link
                        href={`/events/${event.slug}`}
                        className="font-bold text-indigo-700 hover:underline"
                      >
                        {event.title}
                      </Link>
                      <span className="text-xs text-slate-500">
                        {formatEventDate(event.startsAt, event.timeZone)} ·{" "}
                        {event.venue}, {event.city}
                      </span>
                    </div>
                    {status === "APPROVED" ? (
                      <p className="text-sm font-semibold text-emerald-700">
                        ✅ You&apos;re a sponsor — your card shows on the event
                        page.
                      </p>
                    ) : status === "REQUESTED" ? (
                      <p className="text-sm font-semibold text-amber-700">
                        ⏳ Request sent — waiting for the organiser.
                      </p>
                    ) : (
                      <form action={requestSponsorAction} className="space-y-2">
                        <input type="hidden" name="eventId" value={event.id} />
                        <textarea
                          name="message"
                          rows={2}
                          maxLength={600}
                          placeholder="Hi! We'd like to partner with or sponsor your event. We can offer…"
                          className={inputClass}
                        />
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            type="submit"
                            className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white hover:bg-amber-600"
                          >
                            🤝 Ask to sponsor
                          </button>
                          <Link
                            href={`/events/${event.slug}#sponsor`}
                            className="text-sm font-semibold text-indigo-700 hover:underline"
                          >
                            See paid sponsor packages
                          </Link>
                        </div>
                      </form>
                    )}
                  </Card>
                </li>
              );
            })}
          </ul>
        ) : (
          <Card>
            <p className="text-sm text-slate-600">
              No upcoming events near {business.city} right now — check back
              soon.
            </p>
          </Card>
        )
      ) : null}
    </div>
  );
}
