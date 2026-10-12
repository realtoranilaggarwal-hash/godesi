import Link from "next/link";
import { dealDetails, liveDeals } from "@/lib/deals";
import { DealCard } from "@/components/DealCard";

/** The newest business offers, with a way into /deals and to post one. */
export async function DealsStrip() {
  const deals = await liveDeals({ take: 4 });
  if (!deals.length) return null;

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-xl font-bold">🏷️ Deals from desi businesses</h2>
        <div className="flex gap-3 text-sm font-semibold">
          <Link
            href="/dashboard/deals"
            className="text-slate-600 hover:underline"
          >
            Post a deal
          </Link>
          <Link href="/deals" className="text-indigo-600 hover:underline">
            All deals →
          </Link>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
    </section>
  );
}
