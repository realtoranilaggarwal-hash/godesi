import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCategoryTree } from "@/lib/directory";
import { EventCard } from "@/components/EventCard";
import { FeaturedEventStrip } from "@/components/FeaturedEvents";
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

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Events & tickets",
  description:
    "Melas, workshops, weddings expos, satsangs and community events near you — book tickets instantly.",
};

export default async function EventsPage({
  searchParams,
}: {
  searchParams: {
    city?: string;
    category?: string;
    when?: string;
    type?: string;
    mode?: string;
    venue?: string;
    feature?: string | string[];
  };
}) {
  const { city, category, when, type, mode, venue } = searchParams;
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

  /** Toggling a chip keeps every other filter in the query string. */
  const featureHref = (feature: string) => {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (category) params.set("category", category);
    if (when) params.set("when", when);
    if (type) params.set("type", type);
    if (mode) params.set("mode", mode);
    if (venue) params.set("venue", venue);
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

  const events = await db.event.findMany({
    where: {
      status: "APPROVED",
      ...(when === "past"
        ? { startsAt: { lt: new Date() } }
        : { startsAt: { gte: new Date() } }),
      ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
      ...(scope
        ? {
            OR: [
              { categorySlug: { in: scope } },
              { categorySlugs: { hasSome: scope } },
            ],
          }
        : {}),
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
          <div className="mt-4 flex flex-wrap gap-2">
            <LinkButton href="/events/new" variant="secondary">
              Post your event
            </LinkButton>
            <Link
              href={when === "past" ? "/events" : "/events?when=past"}
              className="rounded-xl border border-white/70 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              {when === "past" ? "Upcoming events" : "Past events"}
            </Link>
          </div>
        </section>

        <FeaturedEventStrip />

        <Card>
          <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
            <input
              name="city"
              defaultValue={city ?? ""}
              placeholder="City"
              className={inputClass}
              aria-label="City"
            />
            <select
              name="category"
              defaultValue={category ?? ""}
              className={inputClass}
              aria-label="Category"
            >
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.icon} {item.name}
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
            title="No events here yet"
            body="Be the first to list one — posting an event is free."
          />
        )}

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
