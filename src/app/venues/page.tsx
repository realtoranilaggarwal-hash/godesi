import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Card, EmptyState, LinkButton, inputClass } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Event venues — banquet halls, temples and community centres | Godesi",
  description:
    "Every venue desi events are held at, with the halls used, address and upcoming events. Add yours by posting an event.",
};

export default async function VenuesPage({
  searchParams,
}: {
  searchParams: { q?: string; city?: string };
}) {
  const q = (searchParams.q ?? "").trim();
  const city = (searchParams.city ?? "").trim();
  const like = { mode: "insensitive" as const };

  const venues = await db.venue.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { name: { contains: q, ...like } },
              { address: { contains: q, ...like } },
              { city: { contains: q, ...like } },
            ],
          }
        : {}),
      ...(city ? { city: { contains: city, ...like } } : {}),
    },
    orderBy: [{ city: "asc" }, { name: "asc" }],
    take: 200,
    include: {
      _count: {
        select: { events: { where: { status: "APPROVED" } } },
      },
      events: {
        where: { status: "APPROVED", startsAt: { gte: new Date() } },
        orderBy: { startsAt: "asc" },
        take: 3,
        select: { slug: true, title: true, startsAt: true },
      },
    },
  });

  return (
    <div className="space-y-4">
      <Card className="border-violet-200 bg-gradient-to-br from-violet-50 via-white to-sky-50">
        <h1 className="text-2xl font-black sm:text-3xl">📍 Event venues</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-700">
          Banquet halls, temples, gurdwaras, community centres and grounds where
          desi events happen. Every venue an organiser adds is saved here, so the
          next organiser can pick it — and guests can see what is coming up.
        </p>
        <form className="mt-3 flex flex-wrap gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Venue name or address"
            className={`${inputClass} max-w-xs`}
          />
          <input
            name="city"
            defaultValue={city}
            placeholder="City"
            className={`${inputClass} max-w-[180px]`}
          />
          <button
            type="submit"
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-700"
          >
            Search venues
          </button>
          <LinkButton href="/events/new">➕ Post an event here</LinkButton>
        </form>
      </Card>

      {venues.length === 0 ? (
        <EmptyState
          title="No venues match that search yet"
          body="Venues are added automatically when an organiser posts an event."
          action={<LinkButton href="/events/new">Post an event</LinkButton>}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {venues.map((venue) => (
            <Card key={venue.id} className="flex flex-col gap-2">
              <div>
                <p className="font-bold text-slate-900">{venue.name}</p>
                <p className="text-xs text-slate-500">
                  {[venue.city, venue.state, venue.country]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {venue.address ? (
                  <p className="mt-1 text-xs text-slate-600">{venue.address}</p>
                ) : null}
              </div>

              {venue.halls.length ? (
                <p className="text-xs text-slate-600">
                  Halls: {venue.halls.join(" · ")}
                </p>
              ) : null}

              {venue.events.length ? (
                <ul className="space-y-1 text-xs">
                  {venue.events.map((event) => (
                    <li key={event.slug}>
                      <Link
                        href={`/events/${event.slug}`}
                        className="font-semibold text-indigo-600 hover:underline"
                      >
                        {event.title}
                      </Link>{" "}
                      <span className="text-slate-500">
                        {event.startsAt.toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500">No upcoming events listed.</p>
              )}

              <div className="mt-auto flex flex-wrap items-center gap-3 text-xs font-semibold">
                <Link
                  href={`/events?venue=${encodeURIComponent(venue.name)}`}
                  className="text-indigo-600 hover:underline"
                >
                  All {venue._count.events} events →
                </Link>
                {venue.mapsUrl ? (
                  <a
                    href={venue.mapsUrl}
                    target="_blank"
                    rel="noreferrer nofollow"
                    className="text-emerald-700 hover:underline"
                  >
                    Map ↗
                  </a>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
}
