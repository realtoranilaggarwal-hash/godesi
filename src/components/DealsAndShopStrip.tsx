import Link from "next/link";
import { dealDetails, liveDeals } from "@/lib/deals";
import { liveStoreOffers } from "@/lib/storeOffers";
import { SHOP_SHELVES } from "@/lib/shop";
import { DealCard } from "@/components/DealCard";
import { StoreOfferCard } from "@/components/StoreOfferCard";

/** Business deals, online store offers and shop shelves, for the foot of posting pages. */
export async function DealsAndShopStrip() {
  const [deals, storeOffers] = await Promise.all([
    liveDeals({ take: 4 }),
    liveStoreOffers(3),
  ]);

  return (
    <section className="space-y-5 rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 via-white to-indigo-50 p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">
            🏷️ Deals &amp; shopping on GoDesi
          </h2>
          <p className="text-sm text-slate-600">
            Got an offer for your customers? Post it free and it shows on your
            card, on /deals and on the home page.
          </p>
        </div>
        <Link
          href="/dashboard/deals"
          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-bold text-white hover:bg-indigo-700"
        >
          Post a deal
        </Link>
      </div>

      {deals.length ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold">From desi businesses</h3>
            <Link
              href="/deals"
              className="text-sm font-semibold text-indigo-600 hover:underline"
            >
              All deals →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
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
        </div>
      ) : null}

      {storeOffers.length ? (
        <div className="space-y-2">
          <h3 className="font-bold">Online store deals</h3>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {storeOffers.map((offer) => (
              <StoreOfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-bold">🛍️ Desi shop</h3>
          <Link
            href="/shop"
            className="text-sm font-semibold text-indigo-600 hover:underline"
          >
            Open the shop →
          </Link>
        </div>
        <ul className="flex flex-wrap gap-2">
          {SHOP_SHELVES.map((shelf) => (
            <li key={shelf.key}>
              <Link
                href={`/shop#${shelf.key}`}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-700"
              >
                {shelf.icon} {shelf.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {storeOffers.length ? (
        <p className="text-xs text-slate-500">
          Store deals and the shop are paid links: GoDesi may earn a commission
          at no extra cost to you. They never earn GoDesi points.
        </p>
      ) : null}
    </section>
  );
}
