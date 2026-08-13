import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { ListingCard } from "@/components/ListingCard";
import { PropertyFilters, type PropertySearch } from "@/components/PropertyFilters";
import { InlineBanner, SidebarBanners } from "@/components/Banners";
import { FairHousingNotice } from "@/components/FairHousingNotice";
import { Card, EmptyState, LinkButton } from "@/components/ui";
import { NeedHelpBox, TradingTips } from "@/components/NeedHelp";
import { LISTING_INCLUDE, listingWhere } from "@/lib/listings";
import {
  PROPERTY_GROUP_LABELS,
  hasPropertyFilters,
  propertyWhere,
} from "@/lib/property";

export const dynamic = "force-dynamic";

export function generateMetadata({
  searchParams,
}: {
  searchParams: PropertySearch;
}): Metadata {
  const group =
    searchParams.group && searchParams.group in PROPERTY_GROUP_LABELS
      ? PROPERTY_GROUP_LABELS[searchParams.group as keyof typeof PROPERTY_GROUP_LABELS]
      : null;
  const city = searchParams.city?.trim();
  const what = group ? `${group} property` : "Property";

  return {
    title: city
      ? `${what} in ${city} — buy, rent and sell on Godesi`
      : `${what} — buy, sell and rent on Godesi`,
    description:
      "Desi property marketplace: flats, villas, plots, shops, offices and new projects for sale or rent in India and the USA. Filter by city, budget, BHK and amenities, then message the owner, agent or builder on WhatsApp.",
    alternates: {
      canonical: "/real-estate",
      types: { "application/rss+xml": "/real-estate/rss.xml" },
    },
  };
}

const QUICK_LINKS = [
  { href: "/real-estate?kind=PROPERTY_SALE", label: "🔍 Buy" },
  { href: "/real-estate?kind=PROPERTY_RENT", label: "🔑 Rent" },
  { href: "/real-estate/start?do=sell", label: "🏷️ Sell yours" },
  { href: "/real-estate/start?do=list", label: "🏢 List for rent" },
  { href: "/real-estate?nri=1", label: "🌏 NRI listings" },
  { href: "/real-estate?deal=1", label: "📈 Investment deals" },
  { href: "/rooms", label: "🛏️ Rooms & PG" },
];

export default async function RealEstatePage({
  searchParams,
}: {
  searchParams: PropertySearch;
}) {
  const where = {
    ...listingWhere("real-estate", searchParams),
    ...propertyWhere(searchParams),
  };
  // A plain /real-estate?kind=… is still the "browse" view, so it does not count.
  const narrowing = { ...searchParams };
  delete narrowing.kind;
  const narrowed = hasPropertyFilters(narrowing);

  const [listings, featured, rooms] = await Promise.all([
    db.listing.findMany({
      where,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      include: LISTING_INCLUDE,
      take: 60,
    }),
    narrowed
      ? Promise.resolve([])
      : db.listing.findMany({
          where: { ...listingWhere("real-estate", {}), featured: true },
          orderBy: { createdAt: "desc" },
          include: LISTING_INCLUDE,
          take: 3,
        }),
    narrowed
      ? Promise.resolve([])
      : db.listing.findMany({
          where: listingWhere("rooms", {}),
          orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
          include: LISTING_INCLUDE,
          take: 3,
        }),
  ]);

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-6">
        <section className="rounded-3xl bg-gradient-to-r from-orange-500 via-rose-500 to-fuchsia-600 px-5 py-7 text-white sm:px-8">
          <h1 className="text-3xl font-black">Property & real estate 🏢</h1>
          <p className="mt-1 max-w-xl text-white/90">
            Buy, sell or rent — flats, villas, plots, shops, offices and new
            projects, listed by owners, agents and builders in our community
            across India and the USA.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <LinkButton href="/real-estate/start" variant="secondary">
              What do you want to do?
            </LinkButton>
            <LinkButton
              href="/listings/new?kind=PROPERTY_SALE"
              variant="ghost"
              className="bg-white/15 text-white hover:bg-white/25"
            >
              Post a property free
            </LinkButton>
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-orange-300"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Card>
          <PropertyFilters filters={searchParams} />
        </Card>

        {featured.length ? (
          <section className="space-y-3">
            <h2 className="text-lg font-bold">⭐ Featured property</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {featured.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-bold">
              {narrowed ? "Matching property" : "Latest property"}
            </h2>
            <span className="text-sm text-slate-500">
              {listings.length} listing{listings.length === 1 ? "" : "s"}
            </span>
          </div>
          {listings.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nothing matches yet"
              body="Try widening the filters, or be the first to list here — it is free."
            />
          )}
        </section>

        {rooms.length ? (
          <section className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-bold">
                Also here — single rooms, PG and flatmates
              </h2>
              <Link
                href="/rooms"
                className="text-sm font-semibold text-indigo-600 hover:underline"
              >
                See all →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {rooms.map((listing) => (
                <ListingCard key={listing.id} listing={listing} cityBase="/rooms" />
              ))}
            </div>
          </section>
        ) : null}

        <Card className="bg-amber-50">
          <h2 className="font-bold">Selling faster on Godesi</h2>
          <p className="mt-1 text-sm text-slate-700">
            Free listings show in every search. A featured listing sits on top of
            its city and in the ⭐ strip on the home page, and agents can run a
            banner across the property pages.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold">
            <Link
              href="/pricing"
              className="rounded-xl bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700"
            >
              Feature my listing
            </Link>
            <Link
              href="/advertise"
              className="rounded-xl border border-slate-300 px-3 py-2 hover:bg-white"
            >
              Agent banner ads
            </Link>
          </div>
        </Card>

        <FairHousingNotice />
        <TradingTips />
        <InlineBanner />
      </div>

      <aside className="hidden w-[300px] shrink-0 space-y-4 lg:block">
        <TradingTips compact />
        <NeedHelpBox />
        <SidebarBanners />
      </aside>
    </div>
  );
}
