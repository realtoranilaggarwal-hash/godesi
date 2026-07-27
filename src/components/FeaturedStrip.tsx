import Link from "next/link";
import { featuredBusinesses } from "@/lib/businesses";
import { BusinessCard } from "@/components/BusinessCard";

/**
 * Paid listings scroll along the top; the last card sells the same placement to
 * everyone still on the free plan.
 */
export async function FeaturedStrip({
  categorySlugs,
  title = "Featured businesses",
}: {
  categorySlugs?: string[];
  title?: string;
}) {
  const businesses = await featuredBusinesses(categorySlugs);

  return (
    <section aria-label={title}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-black text-slate-900">⭐ {title}</h2>
        <Link
          href="/pricing"
          className="text-sm font-semibold text-rose-600 hover:underline"
        >
          Feature your business →
        </Link>
      </div>

      <div className="-mx-1 mt-3 flex snap-x gap-3 overflow-x-auto px-1 pb-2">
        {businesses.map((business) => (
          <div
            key={business.id}
            className="w-[280px] shrink-0 snap-start sm:w-[320px]"
          >
            <BusinessCard business={business} />
          </div>
        ))}

        <Link
          href="/pricing"
          className="flex w-[280px] shrink-0 snap-start flex-col justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-rose-500 to-fuchsia-600 p-5 text-white sm:w-[320px]"
        >
          <span className="text-2xl" aria-hidden>
            ⭐
          </span>
          <span className="mt-2 text-base font-black leading-tight">
            Feature your business here
          </span>
          <span className="mt-1 text-sm text-white/90">
            Upgrade to sit at the top of this strip and above free listings in
            search.
          </span>
          <span className="mt-3 text-sm font-bold underline">See plans →</span>
        </Link>
      </div>
    </section>
  );
}
