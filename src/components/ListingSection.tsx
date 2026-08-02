import Link from "next/link";
import { db } from "@/lib/db";
import { gradientFor } from "@/lib/categories";
import {
  LISTING_INCLUDE,
  listingWhere,
  type ListingFilters as Filters,
  type ListingSection as Section,
} from "@/lib/listings";
import { ListingCard } from "@/components/ListingCard";
import { ListingFilters } from "@/components/ListingFilters";
import { InlineBanner, SidebarBanners } from "@/components/Banners";
import {
  FairHousingNotice,
  RoomSharingNotice,
} from "@/components/FairHousingNotice";
import { Card, EmptyState, LinkButton } from "@/components/ui";
import { NeedHelpBox, TradingTips } from "@/components/NeedHelp";

const CROSS_SECTION: Partial<
  Record<Section, { section: Section; title: string; href: string }>
> = {
  rooms: {
    section: "real-estate",
    title: "Also to rent — whole flats and houses",
    href: "/real-estate",
  },
  "real-estate": {
    section: "rooms",
    title: "Also here — single rooms and roommates",
    href: "/rooms",
  },
};

/** Shared shell for /real-estate and /rooms — same query, different copy. */
export async function ListingSectionPage({
  section,
  filters,
  title,
  blurb,
  color,
  postHref,
  postLabel,
}: {
  section: Section;
  filters: Filters;
  title: string;
  blurb: string;
  color: string;
  postHref: string;
  postLabel: string;
}) {
  // Rooms and rentals get mixed up constantly — a room posted as "property for
  // rent" is invisible on /rooms — so each page also shows the other one.
  const also = CROSS_SECTION[section];

  const [listings, crossListings] = await Promise.all([
    db.listing.findMany({
      where: listingWhere(section, filters),
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      include: LISTING_INCLUDE,
      take: 60,
    }),
    also
      ? db.listing.findMany({
          where: listingWhere(also.section, {}),
          orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
          include: LISTING_INCLUDE,
          take: 3,
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-6">
        <section
          className={`rounded-3xl bg-gradient-to-r ${gradientFor(color)} px-5 py-8 text-white sm:px-8`}
        >
          <h1 className="text-3xl font-black">{title}</h1>
          <p className="mt-1 max-w-xl text-white/90">{blurb}</p>
          <div className="mt-4">
            <LinkButton href={postHref} variant="secondary">
              {postLabel}
            </LinkButton>
          </div>
        </section>

        <Card>
          <ListingFilters section={section} filters={filters} />
        </Card>

        {listings.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                cityBase={`/${section}`}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nothing matches yet"
            body="Try widening the filters, or be the first to post here — it is free."
          />
        )}

        {also && crossListings.length ? (
          <section className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-bold">{also.title}</h2>
              <Link
                href={also.href}
                className="text-sm font-semibold text-indigo-600 hover:underline"
              >
                See all →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {crossListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  cityBase={also.href}
                />
              ))}
            </div>
          </section>
        ) : null}

        <p className="text-sm text-slate-500">
          Have something to list?{" "}
          <Link href={postHref} className="font-semibold text-indigo-600">
            {postLabel}
          </Link>{" "}
          — buyers reach you straight on WhatsApp.
        </p>
        {section === "real-estate" || section === "rooms" ? (
          <FairHousingNotice />
        ) : null}
        {section === "rooms" ? <RoomSharingNotice /> : null}

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
