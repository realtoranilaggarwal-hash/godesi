import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { gradientFor } from "@/lib/categories";
import { formatFestivalDate, upcomingFestivals } from "@/lib/festivals";
import { formatEventDate } from "@/lib/events";
import {
  FAITHS,
  FAITH_ICONS,
  FAITH_LABELS,
  isFaith,
  worshipWhere,
  type WorshipFilters,
} from "@/lib/worship";
import { WorshipCard } from "@/components/WorshipCard";
import { NewsCard } from "@/components/NewsCard";
import { InlineBanner, SidebarBanners } from "@/components/Banners";
import { Card, EmptyState, LinkButton, inputClass } from "@/components/ui";
import { freshNewsCutoff } from "@/lib/news";
import {
  VAISNAVA_CREDIT,
  upcomingObservances,
} from "@/lib/vaisnavaCalendar";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Temples, gurudwaras, mosques & churches",
  description:
    "Find desi places of worship near you, upcoming festival dates, temple events by city and spiritual news — added by the community.",
};

export default async function ReligiousPage({
  searchParams,
}: {
  searchParams: WorshipFilters;
}) {
  const [places, events, news] = await Promise.all([
    db.worshipPlace.findMany({
      where: worshipWhere(searchParams),
      orderBy: [{ name: "asc" }],
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      take: 48,
    }),
    db.event.findMany({
      where: {
        status: "APPROVED",
        startsAt: { gte: new Date() },
        categorySlug: { startsWith: "religious" },
        ...(searchParams.city
          ? { city: { contains: searchParams.city, mode: "insensitive" } }
          : {}),
      },
      orderBy: { startsAt: "asc" },
      take: 6,
      select: {
        id: true,
        slug: true,
        title: true,
        city: true,
        venue: true,
        startsAt: true,
      },
    }),
    db.newsItem.findMany({
      where: {
        status: "PUBLISHED",
        topic: "faith",
        publishedAt: { gte: freshNewsCutoff() },
      },
      orderBy: { publishedAt: "desc" },
      take: 6,
    }),
  ]);

  const festivals = upcomingFestivals(6);
  const observances = await upcomingObservances(8);

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-6">
        <section
          className={`rounded-3xl bg-gradient-to-r ${gradientFor("amber")} px-5 py-8 text-white sm:px-8`}
        >
          <h1 className="text-3xl font-black">Religious & cultural 🛕</h1>
          <p className="mt-1 max-w-xl text-white/90">
            Temples, gurudwaras, mosques and churches near you — with festival
            dates, community events and a WhatsApp link to join in.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <LinkButton href="/religious/new" variant="secondary">
              Add a place of worship
            </LinkButton>
            <LinkButton href="/events/new" variant="secondary">
              Post a temple event
            </LinkButton>
          </div>
        </section>

        <Card>
          <h2 className="mb-3 font-bold">Upcoming festivals</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {festivals.map((festival) => (
              <div
                key={festival.name}
                className="rounded-2xl border border-amber-200 bg-gradient-to-br from-white to-amber-50 p-3"
              >
                <p className="font-bold">
                  {festival.emoji} {festival.name}
                </p>
                <p className="text-sm font-semibold text-amber-700">
                  {formatFestivalDate(festival.date)}
                  {festival.daysAway === 0
                    ? " · today"
                    : ` · in ${festival.daysAway} day${festival.daysAway === 1 ? "" : "s"}`}
                </p>
                <p className="mt-1 text-sm text-slate-600">{festival.blurb}</p>
              </div>
            ))}
          </div>
        </Card>

        {observances.length ? (
          <Card>
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-bold">Vaishnava calendar</h2>
              <a
                href="https://www.vaisnavacalendar.info"
                target="_blank"
                rel="noreferrer noopener"
                className="text-xs font-semibold text-slate-500 hover:text-indigo-700"
              >
                Dates from {VAISNAVA_CREDIT} →
              </a>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {observances.map((observance) => (
                <li
                  key={`${observance.title}-${observance.date.toISOString()}`}
                  className="flex items-baseline gap-2 rounded-xl border border-violet-100 bg-violet-50/60 px-3 py-2 text-sm"
                >
                  <span className="whitespace-nowrap font-bold text-violet-800">
                    {formatFestivalDate(observance.date)}
                  </span>
                  <span className="text-slate-700">{observance.title}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-slate-500">
              Ekadashi and appearance days for the New York timezone. Confirm
              fasting times with your temple.
            </p>
          </Card>
        ) : null}

        <Card>
          <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              name="q"
              defaultValue={searchParams.q ?? ""}
              placeholder="Search by name"
              aria-label="Search places of worship"
              className={inputClass}
            />
            <input
              name="city"
              defaultValue={searchParams.city ?? ""}
              placeholder="City"
              aria-label="City"
              className={inputClass}
            />
            <select
              name="faith"
              defaultValue={
                isFaith(searchParams.faith) ? searchParams.faith : ""
              }
              aria-label="Type of place"
              className={inputClass}
            >
              <option value="">All faiths</option>
              {FAITHS.map((faith) => (
                <option key={faith} value={faith}>
                  {FAITH_LABELS[faith]}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Apply filters
            </button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2">
            {FAITHS.map((faith) => (
              <Link
                key={faith}
                href={`/religious?faith=${faith}`}
                className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-700"
              >
                {FAITH_ICONS[faith]} {FAITH_LABELS[faith]}
              </Link>
            ))}
          </div>
        </Card>

        {places.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {places.map((place) => (
              <WorshipCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nothing listed here yet"
            body="Be the first to add a temple, gurudwara, mosque or church in your city — it takes a minute."
          />
        )}

        <p className="text-xs text-slate-400">
          Starter entries come from{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            className="underline"
            rel="noreferrer"
            target="_blank"
          >
            OpenStreetMap contributors
          </a>{" "}
          (ODbL); everything else is added by the community.
        </p>

        {events.length ? (
          <Card>
            <h2 className="mb-3 font-bold">Upcoming events</h2>
            <ul className="space-y-2">
              {events.map((event) => (
                <li
                  key={event.id}
                  className="rounded-xl border border-slate-200 px-3 py-2"
                >
                  <Link
                    href={`/events/${event.slug}`}
                    className="font-semibold text-indigo-600 hover:underline"
                  >
                    {event.title}
                  </Link>
                  <p className="text-sm text-slate-600">
                    {formatEventDate(event.startsAt)} · {event.venue},{" "}
                    {event.city}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        {news.length ? (
          <div>
            <h2 className="mb-3 text-lg font-bold">
              Faith & spirituality news
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {news.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        ) : null}
        <InlineBanner />
      </div>

      <SidebarBanners />
    </div>
  );
}
