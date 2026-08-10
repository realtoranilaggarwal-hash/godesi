import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { cityNames } from "@/lib/cities";
import { newsPath } from "@/lib/newsLinks";
import { siteUrl } from "@/lib/format";
import { Card, EmptyState } from "@/components/ui";
import { SidebarBanners } from "@/components/Banners";

export const dynamic = "force-dynamic";

/** Anything posted with this city on it, whatever section it lives in. */
async function loadCity(slug: string) {
  const names = await cityNames(slug);
  if (!names.length) return null;

  const where = { city: { in: names } };
  const [reports, businesses, events, listings, worship] = await Promise.all([
    db.newsItem.findMany({
      where: { status: "PUBLISHED", ...where },
      orderBy: { publishedAt: "desc" },
      take: 12,
      select: {
        id: true,
        title: true,
        summary: true,
        publishedAt: true,
        source: true,
      },
    }),
    db.business.findMany({
      where: { status: "APPROVED", ...where },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { slug: true, name: true, category: true },
    }),
    db.event.findMany({
      where: { status: "APPROVED", startsAt: { gte: new Date() }, ...where },
      orderBy: { startsAt: "asc" },
      take: 8,
      select: { slug: true, title: true, startsAt: true, venue: true },
    }),
    db.listing.findMany({
      where: { status: "APPROVED", ...where },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { slug: true, title: true, kind: true, categorySlug: true },
    }),
    db.worshipPlace.findMany({
      where: { status: "APPROVED", ...where },
      orderBy: { name: "asc" },
      take: 8,
      select: { slug: true, name: true, faith: true },
    }),
  ]);

  // The shortest spelling reads best as a title: "Iselin", not "Iselin NJ, USA".
  const name = [...names].sort((a, b) => a.length - b.length)[0];
  return { name, reports, businesses, events, listings, worship };
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const names = await cityNames(params.slug);
  if (!names.length) return { title: "City not found" };
  const city = [...names].sort((a, b) => a.length - b.length)[0];
  return {
    title: `${city} — desi news, businesses, events and rentals | Godesi`,
    description: `Everything desi in ${city}: community news reported by members, local businesses and professionals, upcoming events, property and rooms, temples and places of worship.`,
    alternates: { canonical: `${siteUrl()}/city/${params.slug}` },
  };
}

function Section({
  title,
  href,
  children,
}: {
  title: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-black">{title}</h2>
        {href ? (
          <Link
            href={href}
            className="text-xs font-semibold text-indigo-600 hover:underline"
          >
            See all →
          </Link>
        ) : null}
      </div>
      {children}
    </Card>
  );
}

function Row({
  href,
  title,
  meta,
}: {
  href: string;
  title: string;
  meta: string;
}) {
  return (
    <li className="py-2">
      <Link
        href={href}
        className="font-semibold text-slate-900 hover:text-indigo-600"
      >
        {title}
      </Link>
      <p className="text-xs text-slate-500">{meta}</p>
    </li>
  );
}

export default async function CityPage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await loadCity(params.slug);
  if (!data) notFound();

  const { name, reports, businesses, events, listings, worship } = data;
  const empty =
    !reports.length &&
    !businesses.length &&
    !events.length &&
    !listings.length &&
    !worship.length;

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-4">
        <Card className="bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white">
          <h1 className="text-2xl font-black">📍 Everything desi in {name}</h1>
          <p className="mt-1 text-sm text-white/90">
            Community news, businesses, events, property and temples — all
            tagged {name}.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm font-bold">
            <Link
              href="/post"
              className="rounded-xl bg-white px-3 py-2 text-indigo-700"
            >
              Post something in {name}
            </Link>
            <Link
              href={`/find?city=${encodeURIComponent(name)}`}
              className="rounded-xl border border-white/40 px-3 py-2"
            >
              Search {name}
            </Link>
          </div>
        </Card>

        {empty ? (
          <EmptyState
            title={`Nothing posted in ${name} yet`}
            body="Be the first — post a business card, an event or a local news report."
            action={
              <Link
                href="/post"
                className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-bold text-white"
              >
                Post something
              </Link>
            }
          />
        ) : null}

        {reports.length ? (
          <Section title="📰 News from here" href="/news">
            <ul className="divide-y divide-slate-100">
              {reports.map((report) => (
                <Row
                  key={report.id}
                  href={newsPath(report)}
                  title={report.title}
                  meta={`${report.source} · ${report.publishedAt.toDateString()}`}
                />
              ))}
            </ul>
          </Section>
        ) : null}

        {businesses.length ? (
          <Section title="🏪 Businesses and professionals" href="/businesses">
            <ul className="divide-y divide-slate-100">
              {businesses.map((business) => (
                <Row
                  key={business.slug}
                  href={`/b/${business.slug}`}
                  title={business.name}
                  meta={business.category}
                />
              ))}
            </ul>
          </Section>
        ) : null}

        {events.length ? (
          <Section title="🎟️ Upcoming events" href="/events">
            <ul className="divide-y divide-slate-100">
              {events.map((event) => (
                <Row
                  key={event.slug}
                  href={`/events/${event.slug}`}
                  title={event.title}
                  meta={`${event.startsAt.toDateString()} · ${event.venue}`}
                />
              ))}
            </ul>
          </Section>
        ) : null}

        {listings.length ? (
          <Section
            title="🏠 Property, rooms and buy & sell"
            href="/marketplace"
          >
            <ul className="divide-y divide-slate-100">
              {listings.map((listing) => (
                <Row
                  key={listing.slug}
                  href={`/listings/${listing.slug}`}
                  title={listing.title}
                  meta={listing.categorySlug ?? listing.kind}
                />
              ))}
            </ul>
          </Section>
        ) : null}

        {worship.length ? (
          <Section title="🛕 Temples and places of worship" href="/religious">
            <ul className="divide-y divide-slate-100">
              {worship.map((place) => (
                <Row
                  key={place.slug}
                  href={`/religious/${place.slug}`}
                  title={place.name}
                  meta={place.faith}
                />
              ))}
            </ul>
          </Section>
        ) : null}
      </div>

      <SidebarBanners />
    </div>
  );
}
