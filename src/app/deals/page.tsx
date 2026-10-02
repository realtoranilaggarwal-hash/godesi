import type { Metadata } from "next";
import Link from "next/link";
import { siteUrl } from "@/lib/format";
import { dealDetails, liveDeals } from "@/lib/deals";
import { liveStoreOffers } from "@/lib/storeOffers";
import { DealCard } from "@/components/DealCard";
import { StoreOfferCard } from "@/components/StoreOfferCard";
import { EmptyState, LinkButton } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Deals & offers from desi businesses",
  description:
    "Discounts, promo codes and festival offers from Indian and South Asian businesses on GoDesi — caterers, salons, DJs, grocers and more.",
  alternates: { canonical: `${siteUrl()}/deals` },
};

export default async function DealsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const [all, storeOffers] = await Promise.all([
    liveDeals({ take: 200 }),
    liveStoreOffers(12),
  ]);
  // Only categories that have an offer running get a chip.
  const categories = Array.from(
    new Map(
      all.flatMap((deal) =>
        deal.business.categorySlug && deal.business.categoryRef
          ? [
              [
                deal.business.categorySlug,
                {
                  slug: deal.business.categorySlug,
                  ...deal.business.categoryRef,
                },
              ] as const,
            ]
          : [],
      ),
    ).values(),
  );
  const active = categories.find((c) => c.slug === searchParams.category);
  const deals = active
    ? all.filter((deal) => deal.business.categorySlug === active.slug)
    : all;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">🏷️ Deals &amp; offers</h1>
          <p className="text-sm text-slate-600">
            Offers posted by the businesses themselves — mention GoDesi or use
            the code when you contact them.
          </p>
        </div>
        <LinkButton href="/dashboard/deals">
          Post a deal for your business
        </LinkButton>
      </div>

      {categories.length > 1 ? (
        <div className="flex flex-wrap gap-1.5 text-xs">
          <Link
            href="/deals"
            className={`rounded-full border px-3 py-1 font-semibold ${!active ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}
          >
            All
          </Link>
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/deals?category=${category.slug}`}
              className={`rounded-full border px-3 py-1 font-semibold ${active?.slug === category.slug ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}
            >
              {category.icon} {category.name}
            </Link>
          ))}
        </div>
      ) : null}

      {deals.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {deals.map((deal) => (
            <DealCard
              key={deal.id}
              title={deal.title}
              details={dealDetails(deal)}
              code={deal.code}
              linkUrl={deal.linkUrl}
              expiresAt={deal.expiresAt}
              business={{
                slug: deal.business.slug,
                name: deal.business.name,
                city: deal.business.city,
                logoUrl: deal.business.logoUrl,
                icon: deal.business.categoryRef?.icon,
                line:
                  deal.business.subcategoryRef?.name ??
                  deal.business.categoryRef?.name,
              }}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={active ? `No ${active.name} deals right now` : "No deals yet"}
          body="Run a business? Post the first offer — it's free and shows on your card too."
          action={<LinkButton href="/dashboard/deals">Post a deal</LinkButton>}
        />
      )}

      {storeOffers.length ? (
        <section className="space-y-3 border-t border-slate-200 pt-5">
          <div>
            <h2 className="text-lg font-bold">🛒 Online store deals</h2>
            <p className="text-xs text-slate-600">
              Coupons and sales from online stores, not GoDesi businesses. These
              are paid links: GoDesi may earn a commission when you buy, at no
              extra cost to you. Terms, prices and stock are set by each store.{" "}
              <Link
                href="/shop"
                className="font-semibold text-indigo-700 underline"
              >
                More in the shop
              </Link>
              .
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {storeOffers.map((offer) => (
              <StoreOfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
