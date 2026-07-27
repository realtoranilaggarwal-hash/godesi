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
import { Card, EmptyState, LinkButton } from "@/components/ui";

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
  const listings = await db.listing.findMany({
    where: listingWhere(section, filters),
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    include: LISTING_INCLUDE,
    take: 60,
  });

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
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nothing matches yet"
            body="Try widening the filters, or be the first to post here — it is free."
          />
        )}

        <p className="text-sm text-slate-500">
          Have something to list?{" "}
          <Link href={postHref} className="font-semibold text-indigo-600">
            {postLabel}
          </Link>{" "}
          — buyers reach you straight on WhatsApp.
        </p>
      <InlineBanner />
      </div>

      <SidebarBanners />
    </div>
  );
}
