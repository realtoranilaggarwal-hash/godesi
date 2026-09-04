import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { db } from "@/lib/db";
import { findVenue, venuePath } from "@/lib/venues";
import { Card, EmptyState, LinkButton } from "@/components/ui";
import { EventCard } from "@/components/EventCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { key: string };
}): Promise<Metadata> {
  const venue = await findVenue(params.key);
  if (!venue) return { title: "Venue not found | Godesi" };
  return {
    title: `${venue.name}, ${venue.city} — events & tickets | Godesi`,
    description: `Upcoming desi events at ${venue.name}, ${venue.city}${
      venue.address ? ` (${venue.address})` : ""
    } — halls, website, map and tickets.`,
  };
}

export default async function VenuePage({
  params,
}: {
  params: { key: string };
}) {
  const venue = await findVenue(params.key);
  if (!venue) notFound();
  if (venue.slug && venue.slug !== params.key) permanentRedirect(venuePath(venue));

  const now = new Date();
  const [upcoming, past] = await Promise.all([
    db.event.findMany({
      where: { venueRefId: venue.id, status: "APPROVED", startsAt: { gte: now } },
      orderBy: { startsAt: "asc" },
      take: 48,
      include: { category: { select: { name: true, icon: true, color: true } } },
    }),
    db.event.findMany({
      where: { venueRefId: venue.id, status: "APPROVED", startsAt: { lt: now } },
      orderBy: { startsAt: "desc" },
      take: 12,
      include: { category: { select: { name: true, icon: true, color: true } } },
    }),
  ]);

  const place = [venue.city, venue.state, venue.country].filter(Boolean).join(", ");

  return (
    <div className="space-y-6">
      <Card className="border-violet-200 bg-gradient-to-br from-violet-50 via-white to-sky-50">
        <Link href="/venues" className="text-xs font-semibold text-violet-700 hover:underline">
          ← All venues
        </Link>
        <h1 className="mt-1 text-2xl font-black sm:text-3xl">📍 {venue.name}</h1>
        <p className="text-sm text-slate-600">{place}</p>
        {venue.address ? (
          <p className="mt-1 text-sm text-slate-700">{venue.address}</p>
        ) : null}
        {venue.halls.length ? (
          <p className="mt-2 text-sm text-slate-700">
            <span className="font-semibold">Halls:</span> {venue.halls.join(" · ")}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          {venue.website ? (
            <a
              href={venue.website}
              target="_blank"
              rel="noreferrer nofollow"
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-700"
            >
              Venue website ↗
            </a>
          ) : null}
          {venue.mapsUrl ? (
            <a
              href={venue.mapsUrl}
              target="_blank"
              rel="noreferrer nofollow"
              className="rounded-xl border border-emerald-300 bg-white px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-50"
            >
              Open in maps ↗
            </a>
          ) : null}
          <LinkButton href="/events/new">➕ Post an event here</LinkButton>
        </div>
      </Card>

      <section>
        <h2 className="text-lg font-black">Upcoming events at {venue.name}</h2>
        {upcoming.length === 0 ? (
          <EmptyState
            title="Nothing scheduled here yet"
            body="Organisers who pick this venue when posting an event appear here automatically."
            action={<LinkButton href="/events/new">Post an event</LinkButton>}
          />
        ) : (
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {past.length ? (
        <section>
          <h2 className="text-lg font-black">Past events here</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((event) => (
              <EventCard key={event.id} event={event} variant="compact" />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
