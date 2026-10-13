import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { siteUrl, whatsappLink } from "@/lib/format";
import { formatEventDate } from "@/lib/events";
import { FAITH_ICONS, FAITH_LABELS, WORSHIP_INCLUDE, mapsUrl } from "@/lib/worship";
import { Badge, Card } from "@/components/ui";
import { PostedBy } from "@/components/PostedBy";
import { ShareButtons } from "@/components/ShareButtons";
import { SidebarBanners } from "@/components/Banners";

export const dynamic = "force-dynamic";

async function getPlace(slug: string) {
  return db.worshipPlace.findFirst({
    where: { slug, status: "APPROVED" },
    include: WORSHIP_INCLUDE,
  });
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const place = await getPlace(params.slug);
  if (!place) return { title: "Place not found" };

  const description =
    place.description?.slice(0, 155) ??
    `${FAITH_LABELS[place.faith]} in ${place.city}, ${place.country}.`;

  return {
    title: `${place.name} — ${place.city}`,
    description,
    alternates: { canonical: `${siteUrl()}/religious/${place.slug}` },
    openGraph: {
      title: place.name,
      description,
      images: place.images[0] ? [place.images[0].url] : undefined,
    },
  };
}

export default async function WorshipPlacePage({ params }: { params: { slug: string } }) {
  const place = await getPlace(params.slug);
  if (!place) notFound();

  const events = await db.event.findMany({
    where: {
      status: "APPROVED",
      startsAt: { gte: new Date() },
      city: { equals: place.city, mode: "insensitive" },
      categorySlug: { startsWith: "religious" },
    },
    orderBy: { startsAt: "asc" },
    take: 5,
    select: {
      id: true,
      slug: true,
      title: true,
      venue: true,
      startsAt: true,
      timeZone: true,
    },
  });

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-5">
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="amber">
              {FAITH_ICONS[place.faith]} {FAITH_LABELS[place.faith]}
            </Badge>
            {place.source === "osm" ? <Badge tone="slate">Imported</Badge> : null}
          </div>
          <div>
            <h1 className="text-2xl font-black sm:text-3xl">{place.name}</h1>
            <p className="text-sm text-slate-600">
              📍 {place.address ? `${place.address}, ` : ""}
              {place.city}
              {place.state ? `, ${place.state}` : ""} · {place.country}
            </p>
          </div>
          {place.description ? (
            <p className="whitespace-pre-line text-slate-700">{place.description}</p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {place.whatsapp ? (
              <a
                href={whatsappLink(place.whatsapp, `Namaste! I found ${place.name} on Godesi.`)}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
              >
                💬 Contact / join on WhatsApp
              </a>
            ) : null}
            <a
              href={mapsUrl(place)}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-indigo-300"
            >
              🗺️ Directions
            </a>
            {place.websiteUrl ? (
              <a
                href={place.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-indigo-300"
              >
                🌐 Website
              </a>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
            {place.submittedBy ? (
              <PostedBy user={place.submittedBy} prefix="Added by" />
            ) : (
              <p className="text-sm text-slate-500">Imported from OpenStreetMap</p>
            )}
            <ShareButtons
              url={`${siteUrl()}/religious/${place.slug}`}
              title={place.name}
            />
          </div>
        </Card>

        {place.images.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {place.images.map((image) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={image.id}
                src={image.url}
                alt={place.name}
                className="h-48 w-full rounded-2xl object-cover"
                loading="lazy"
              />
            ))}
          </div>
        ) : null}

        {events.length ? (
          <Card>
            <h2 className="mb-3 font-bold">Upcoming events in {place.city}</h2>
            <ul className="space-y-2">
              {events.map((event) => (
                <li key={event.id} className="rounded-xl border border-slate-200 px-3 py-2">
                  <Link
                    href={`/events/${event.slug}`}
                    className="font-semibold text-indigo-600 hover:underline"
                  >
                    {event.title}
                  </Link>
                  <p className="text-sm text-slate-600">
                    {formatEventDate(event.startsAt, event.timeZone)} · {event.venue}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        <p className="text-sm text-slate-500">
          Something out of date?{" "}
          <Link href="/religious/new" className="font-semibold text-indigo-600">
            Submit an update
          </Link>{" "}
          and our team will review it.
        </p>
      </div>

      <SidebarBanners />
    </div>
  );
}
