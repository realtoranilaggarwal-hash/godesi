import Link from "next/link";
import { dealDetails } from "@/lib/deals";
import { dealOfTheDay } from "@/lib/dealOfTheDay";
import { DealCard } from "@/components/DealCard";
import { StoreOfferCard } from "@/components/StoreOfferCard";

/** Today's one business deal and one store coupon, changing at midnight New York time. */
export async function DealOfTheDay() {
  const { deal, offer } = await dealOfTheDay();
  if (!deal && !offer) return null;

  return (
    <section className="space-y-3 rounded-3xl border border-emerald-200 bg-emerald-50/60 p-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-xl font-bold">⏰ Deal of the day</h2>
        <Link
          href="/deals"
          className="text-sm font-semibold text-indigo-600 hover:underline"
        >
          All deals →
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {deal ? (
          <DealCard
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
        ) : null}
        {offer ? <StoreOfferCard offer={offer} /> : null}
      </div>
      <p className="text-xs text-slate-500">
        A new pick every morning — come back tomorrow.
      </p>
    </section>
  );
}
