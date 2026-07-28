import Link from "next/link";
import { featuredBusinesses, searchBusinesses } from "@/lib/businesses";
import { BusinessCard } from "@/components/BusinessCard";
import { PLANS } from "@/lib/plans";

/** How many cards the strip always shows, paid or not. */
const STRIP_SIZE = 3;

/**
 * Paid listings scroll along the top. Until the slots sell we keep the strip
 * full: recent listings run as a free spotlight and every unsold slot is
 * priced, so the space advertises itself instead of looking empty.
 */
export async function FeaturedStrip({
  categorySlugs,
  title = "Featured businesses",
}: {
  categorySlugs?: string[];
  title?: string;
}) {
  const businesses = await featuredBusinesses(categorySlugs);

  const openSlots = Math.max(STRIP_SIZE - businesses.length, 0);
  const fillers = openSlots
    ? (await searchBusinesses({ categorySlugs, take: 12 }))
        .filter((row) => !businesses.some((paid) => paid.id === row.id))
        .slice(0, openSlots)
    : [];

  const pro = PLANS.PRO;

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

      <div className="no-scrollbar -mx-1 mt-3 flex snap-x gap-3 overflow-x-auto px-1 pb-2">
        {businesses.map((business) => (
          <div
            key={business.id}
            className="w-[280px] shrink-0 snap-start sm:w-[320px]"
          >
            <BusinessCard business={business} />
          </div>
        ))}

        {fillers.map((business, index) => (
          <div
            key={business.id}
            className="w-[280px] shrink-0 snap-start sm:w-[320px]"
          >
            <BusinessCard business={business} />
            <Link
              href="/pricing"
              className="mt-1 block text-center text-[11px] font-semibold text-slate-400 hover:text-rose-600"
            >
              Free spotlight · slot {businesses.length + index + 1} of{" "}
              {STRIP_SIZE} — take it from ₹{pro.priceInr} / $
              {pro.priceUsd.toFixed(2)} a month →
            </Link>
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
            Show your business here
          </span>
          <span className="mt-1 text-sm text-white/90">
            ₹{pro.priceInr} / ${pro.priceUsd.toFixed(2)} a month puts your card
            at the top of this strip and above free listings in search.
          </span>
          <span className="mt-3 text-sm font-bold underline">
            Take this spot →
          </span>
        </Link>
      </div>
    </section>
  );
}
