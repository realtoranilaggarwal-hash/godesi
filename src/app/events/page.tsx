import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCategoryTree } from "@/lib/directory";
import { EventCard } from "@/components/EventCard";
import { FeaturedEventStrip } from "@/components/FeaturedEvents";
import { EventSuppliersStrip } from "@/components/EventSuppliersStrip";
import { planRank } from "@/lib/plans";
import {
  InContentBanner,
  InlineBanner,
  SidebarBanners,
} from "@/components/Banners";
import { ChatPanel } from "@/components/ChatPanel";
import { Card, EmptyState, LinkButton, inputClass } from "@/components/ui";
import { gradientFor } from "@/lib/categories";
import {
  EVENT_FEATURE_FILTERS,
  EVENT_MODES,
  EVENT_TYPES,
  eventFeatureIcon,
} from "@/lib/eventOptions";
import {
  EVENT_WHEN,
  eventDateRange,
  eventTextWhere,
  stateLabel,
  statesMatching,
} from "@/lib/eventSearch";
import {
  EVENT_CATEGORIES,
  EVENT_LANGUAGES,
  isEventCategory,
} from "@/lib/eventCategories";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Desi events & tickets near you",
  description:
    "Melas, garba nights, workshops, wedding expos, satsangs and community events near you — see the line-up and venue, and book tickets online in a minute.",
  alternates: {
    canonical: "/events",
    types: { "application/rss+xml": "/events/rss.xml" },
  },
};

export default async function EventsPage({
  searchParams,
}: {
  searchParams: {
    city?: string;
    state?: string;
    category?: string;
    genre?: string;
    lang?: string;
    when?: string;
    type?: string;
    mode?: string;
    venue?: string;
    q?: string;
    from?: string;
    to?: string;
    feature?: string | string[];
  };
}) {
  const { city, state, category, when, type, mode, venue, q, from, to } =
    searchParams;
  // The event's own category (garba, comedy, satsang) and the language it runs
  // in — separate from `category`, which is the trade behind it.
  const genre = searchParams.genre && isEventCategory(searchParams.genre)
    ? searchParams.genre
    : undefined;
  const lang = EVENT_LANGUAGES.some(
    (option) => option.slug === searchParams.lang,
  )
    ? searchParams.lang
    : undefined;
  const selectedFeatures = (
    Array.isArray(searchParams.feature)
      ? searchParams.feature
      : searchParams.feature
        ? [searchParams.feature]
        : []
  ).filter((value) =>
    EVENT_FEATURE_FILTERS.includes(
      value as (typeof EVENT_FEATURE_FILTERS)[number],
    ),
  );

  /** Chips change one thing and keep the rest of the search intact. */
  const searchHref = (changes: Record<string, string>) => {
    const params = new URLSearchParams();
    const current: Record<string, string | undefined> = {
      q,
      city,
      state,
      category,
      genre,
      lang,
      when,
      type,
      mode,
      venue,
      from,
      to,
      ...changes,
    };
    for (const [key, value] of Object.entries(current)) {
      if (value) params.set(key, value);
    }
    for (const value of selectedFeatures) params.append("feature", value);
    const query = params.toString();
    return query ? `/events?${query}` : "/events";
  };

  /** Toggling a chip keeps every other filter in the query string. */
  const featureHref = (feature: string) => {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (state) params.set("state", state);
    if (category) params.set("category", category);
    if (genre) params.set("genre", genre);
    if (lang) params.set("lang", lang);
    if (when) params.set("when", when);
    if (type) params.set("type", type);
    if (mode) params.set("mode", mode);
    if (venue) params.set("venue", venue);
    if (q) params.set("q", q);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    for (const value of selectedFeatures) {
      if (value !== feature) params.append("feature", value);
    }
    if (!selectedFeatures.includes(feature)) params.append("feature", feature);
    const query = params.toString();
    return query ? `/events?${query}` : "/events";
  };
  const modeFilter = EVENT_MODES.find((option) => option.value === mode)?.value;
  const categories = await getCategoryTree();
  const scope = category
    ? [
        category,
        ...(categories
          .find((item) => item.slug === category)
          ?.children.map((c) => c.slug) ?? []),
      ]
    : undefined;

  // "Events in Florida" is how people ask, so states get their own chip row.
  const stateRows = await db.event.groupBy({
    by: ["state"],
    where: {
      status: "APPROVED",
      startsAt: { gte: new Date() },
      state: { not: null },
    },
    _count: { state: true },
    orderBy: { _count: { state: "desc" } },
    take: 10,
  });

  const cityRows = await db.event.groupBy({
    by: ["city"],
    where: { status: "APPROVED", startsAt: { gte: new Date() } },
    _count: { city: true },
    orderBy: { _count: { city: "desc" } },
    take: 12,
  });

  // The halls people ask for by name, so "parties at Royal Albert Palace" is one tap.
  const venueRows = await db.event.groupBy({
    by: ["venue"],
    where: { status: "APPROVED", startsAt: { gte: new Date() } },
    _count: { venue: true },
    orderBy: { _count: { venue: "desc" } },
    take: 8,
  });

  // Postgres cannot group by the members of an array, so the facets are counted
  // here from the upcoming events and only the ones with events are offered.
  const facetRows = await db.event.findMany({
    where: { status: "APPROVED", startsAt: { gte: new Date() } },
    select: { genres: true, languages: true },
    take: 1000,
  });
  const genreCounts = new Map<string, number>();
  const languageCounts = new Map<string, number>();
  for (const row of facetRows) {
    for (const slug of row.genres) {
      genreCounts.set(slug, (genreCounts.get(slug) ?? 0) + 1);
    }
    for (const slug of row.languages) {
      languageCounts.set(slug, (languageCounts.get(slug) ?? 0) + 1);
    }
  }
  const genreRows = EVENT_CATEGORIES.filter((option) =>
    genreCounts.has(option.slug),
  )
    .map((option) => ({ ...option, count: genreCounts.get(option.slug) ?? 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 14);
  const languageRows = EVENT_LANGUAGES.filter((option) =>
    languageCounts.has(option.slug),
  ).map((option) => ({
    ...option,
    count: languageCounts.get(option.slug) ?? 0,
  }));

  const events = await db.event.findMany({
    where: {
      status: "APPROVED",
      startsAt: eventDateRange(when, from, to),
      // Both the search box and the category scope are OR groups, so they are
      // combined rather than overwriting one another.
      AND: [
        ...(eventTextWhere(q) ? [eventTextWhere(q)!] : []),
        ...(scope
          ? [
              {
                OR: [
                  { categorySlug: { in: scope } },
                  { categorySlugs: { hasSome: scope } },
                ],
              },
            ]
          : []),
      ],
      ...(genre ? { genres: { has: genre } } : {}),
      ...(lang ? { languages: { has: lang } } : {}),
      // The city box doubles as a state box, so "NJ" or "New Jersey" works in it.
      ...(city
        ? {
            OR: [
              { city: { contains: city, mode: "insensitive" as const } },
              ...statesMatching(city).map((match) => ({
                state: { equals: match, mode: "insensitive" as const },
              })),
            ],
          }
        : {}),
      ...(state ? { state: { equals: state, mode: "insensitive" } } : {}),
      ...(venue ? { venue: { contains: venue, mode: "insensitive" } } : {}),
      ...(type ? { eventType: type } : {}),
      ...(modeFilter ? { mode: modeFilter } : {}),
      ...(selectedFeatures.length
        ? { features: { hasEvery: selectedFeatures } }
        : {}),
    },
    orderBy: { startsAt: when === "past" ? "desc" : "asc" },
    take: 48,
    include: {
      category: { select: { name: true, icon: true, color: true } },
      organizer: { select: { plan: true } },
    },
  });

  // Partner events first, then paid organisers, then by date.
  const partnerRank = (status: string) => (status === "APPROVED" ? 1 : 0);
  events.sort(
    (a, b) =>
      Number(b.featured) - Number(a.featured) ||
      partnerRank(b.partnerStatus) - partnerRank(a.partnerStatus) ||
      planRank(b.organizer.plan) - planRank(a.organizer.plan),
  );

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-6">
        <section
          className={`rounded-3xl bg-gradient-to-r ${gradientFor("rose")} px-5 py-8 text-white sm:px-8`}
        >
          <h1 className="text-3xl font-black">Events & tickets 🎟️</h1>
          <p className="mt-1 max-w-xl text-white/90">
            Melas, workshops, expos, satsangs and weddings — book a seat in
            seconds and get a QR ticket on your phone.
          </p>
          <form
            className="mt-4 grid gap-2 rounded-2xl bg-white/15 p-2 backdrop-blur sm:grid-cols-[1.4fr_1fr_1fr_auto]"
            role="search"
          >
            <input
              name="q"
              defaultValue={q ?? ""}
              placeholder="Garba, satsang, temple name…"
              aria-label="Search events"
              className="rounded-xl border-0 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400"
            />
            <input
              name="city"
              defaultValue={city ?? ""}
              placeholder="City or state, e.g. Edison or NJ"
              aria-label="City or state"
              className="rounded-xl border-0 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400"
            />
            <input
              type="date"
              name="from"
              defaultValue={from ?? ""}
              aria-label="On or after this date"
              className="rounded-xl border-0 bg-white px-3 py-2.5 text-sm text-slate-900"
            />
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
            >
              Search
            </button>
          </form>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {EVENT_WHEN.map((option) => {
              const active = (when ?? "") === option.value && !from && !to;
              return (
                <Link
                  key={option.value || "any"}
                  href={searchHref({ when: option.value, from: "", to: "" })}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                    active
                      ? "bg-white text-rose-700"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  {option.label}
                </Link>
              );
            })}
          </div>

          {genreRows.length ? (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-white/70">
                Categories
              </span>
              {genreRows.map((row) => {
                const active = genre === row.slug;
                return (
                  <Link
                    key={row.slug}
                    href={searchHref({ genre: active ? "" : row.slug })}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      active
                        ? "bg-white text-rose-700"
                        : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                  >
                    {row.icon} {row.label} · {row.count}
                  </Link>
                );
              })}
              <Link
                href="/events/categories"
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-white underline hover:bg-white/20"
              >
                All categories →
              </Link>
            </div>
          ) : null}

          {languageRows.length > 1 ? (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-white/70">
                Language
              </span>
              {languageRows.map((row) => {
                const active = lang === row.slug;
                return (
                  <Link
                    key={row.slug}
                    href={searchHref({ lang: active ? "" : row.slug })}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      active
                        ? "bg-white text-rose-700"
                        : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                  >
                    {row.label} · {row.count}
                  </Link>
                );
              })}
            </div>
          ) : null}

          {stateRows.length > 1 ? (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-white/70">
                States
              </span>
              {stateRows.map((row) => {
                const code = row.state ?? "";
                const active = (state ?? "").toLowerCase() === code.toLowerCase();
                return (
                  <Link
                    key={code}
                    href={searchHref({ state: active ? "" : code })}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      active
                        ? "bg-white text-rose-700"
                        : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                  >
                    {stateLabel(code)} · {row._count.state}
                  </Link>
                );
              })}
            </div>
          ) : null}

          {cityRows.length ? (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-white/70">
                Cities
              </span>
              {cityRows.map((row) => {
                const active =
                  (city ?? "").toLowerCase() === row.city.toLowerCase();
                return (
                  <Link
                    key={row.city}
                    href={searchHref({ city: active ? "" : row.city })}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      active
                        ? "bg-white text-rose-700"
                        : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                  >
                    {row.city} · {row._count.city}
                  </Link>
                );
              })}
            </div>
          ) : null}

          {venueRows.length ? (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-white/70">
                Venues
              </span>
              {venueRows.map((row) => {
                const active =
                  (venue ?? "").toLowerCase() === row.venue.toLowerCase();
                return (
                  <Link
                    key={row.venue}
                    href={searchHref({ venue: active ? "" : row.venue })}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      active
                        ? "bg-white text-rose-700"
                        : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                  >
                    {row.venue} · {row._count.venue}
                  </Link>
                );
              })}
              <Link
                href="/venues"
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-white underline hover:bg-white/20"
              >
                All venues →
              </Link>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <LinkButton href="/events/new" variant="secondary">
              Post your event
            </LinkButton>
            <Link
              href="/events/partner"
              className="rounded-xl border border-white/70 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Get featured free 🤝
            </Link>
            {q || city || state || venue || from || to || when || genre || lang ? (
              <Link
                href="/events"
                className="rounded-xl border border-white/70 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                Clear search
              </Link>
            ) : null}
          </div>
        </section>

        <FeaturedEventStrip />

        <Card>
          <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto]">
            <input
              name="city"
              defaultValue={city ?? ""}
              placeholder="City"
              className={inputClass}
              aria-label="City"
            />
            <select
              name="genre"
              defaultValue={genre ?? ""}
              className={inputClass}
              aria-label="Event category"
            >
              <option value="">All categories</option>
              {EVENT_CATEGORIES.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.icon} {item.label}
                </option>
              ))}
            </select>
            <select
              name="lang"
              defaultValue={lang ?? ""}
              className={inputClass}
              aria-label="Language"
            >
              <option value="">Any language</option>
              {EVENT_LANGUAGES.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.label}
                </option>
              ))}
            </select>
            <select
              name="type"
              defaultValue={type ?? ""}
              className={inputClass}
              aria-label="Event type"
            >
              <option value="">Any type</option>
              {EVENT_TYPES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              name="mode"
              defaultValue={mode ?? ""}
              className={inputClass}
              aria-label="Event mode"
            >
              <option value="">Online or in person</option>
              {EVENT_MODES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.icon} {item.label}
                </option>
              ))}
            </select>
            {when ? <input type="hidden" name="when" value={when} /> : null}
            {category ? (
              <input type="hidden" name="category" value={category} />
            ) : null}
            {state ? <input type="hidden" name="state" value={state} /> : null}
            {q ? <input type="hidden" name="q" value={q} /> : null}
            {venue ? <input type="hidden" name="venue" value={venue} /> : null}
            {from ? <input type="hidden" name="from" value={from} /> : null}
            {to ? <input type="hidden" name="to" value={to} /> : null}
            {selectedFeatures.map((feature) => (
              <input
                key={feature}
                type="hidden"
                name="feature"
                value={feature}
              />
            ))}
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Filter
            </button>
          </form>

          <div className="mt-3 border-t border-slate-100 pt-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Parking · food · crowd · vendors
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {EVENT_FEATURE_FILTERS.map((feature) => {
                const active = selectedFeatures.includes(feature);
                return (
                  <Link
                    key={feature}
                    href={featureHref(feature)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                      active
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {eventFeatureIcon(feature)} {feature}
                  </Link>
                );
              })}
            </div>
          </div>
        </Card>

        {events.length ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {events.slice(0, 6).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
            {events.length > 6 ? (
              <>
                <InContentBanner />
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {events.slice(6).map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </>
            ) : null}
          </>
        ) : (
          <EmptyState
            title={
              q || city || from || to
                ? "Nothing matches that search"
                : "No events here yet"
            }
            body={
              q || city || from || to
                ? "Try a wider date range, or clear the search to see everything coming up."
                : "Be the first to list one — posting an event is free."
            }
          />
        )}

        <EventSuppliersStrip />

        <p className="text-sm text-slate-500">
          Organising something?{" "}
          <Link href="/events/new" className="font-semibold text-indigo-600">
            Publish your event
          </Link>{" "}
          and sell tickets with QR check-in.
        </p>
        <ChatPanel />
        <InlineBanner />
      </div>

      <SidebarBanners />
    </div>
  );
}
