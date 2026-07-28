import Link from "next/link";
import { featuredBusinesses, searchBusinesses } from "@/lib/businesses";
import { BusinessCard } from "@/components/BusinessCard";
import { PLANS } from "@/lib/plans";

/** How many cards the strip always shows, paid or not. */
const STRIP_SIZE = 3;

/** An unsold slot sells itself rather than leaving a hole in the row. */
function SlotForSale({ index }: { index: number }) {
  const pro = PLANS.PRO;

  return (
    <Link
      href="/pricing"
      className="flex min-h-[168px] flex-col justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-rose-500 to-fuchsia-600 p-5 text-white transition hover:brightness-110"
    >
      <span className="text-xs font-bold uppercase tracking-widest text-white/80">
        Slot {index} of {STRIP_SIZE} · open
      </span>
      <span className="mt-1 text-base font-black leading-tight">
        Show your business here
      </span>
      <span className="mt-1 text-sm text-white/90">
        ₹{pro.priceInr} / ${pro.priceUsd.toFixed(2)} a month — top of this strip
        and above free listings in search.
      </span>
      <span className="mt-3 text-sm font-bold underline">Take this spot →</span>
    </Link>
  );
}

/**
 * Paid listings lead the strip. Until the slots sell we keep the row full:
 * recent listings run as a free spotlight, and anything still empty becomes a
 * priced "show your business here" slot instead of white space.
 */
export async function FeaturedStrip({
  categorySlugs,
  title = "Featured businesses",
}: {
  categorySlugs?: string[];
  title?: string;
}) {
  const businesses = (await featuredBusinesses(categorySlugs)).slice(
    0,
    STRIP_SIZE,
  );

  const openSlots = Math.max(STRIP_SIZE - businesses.length, 0);
  const fillers = openSlots
    ? (await searchBusinesses({ categorySlugs, take: 12 }))
        .filter((row) => !businesses.some((paid) => paid.id === row.id))
        .slice(0, openSlots)
    : [];

  const forSale = Math.max(STRIP_SIZE - businesses.length - fillers.length, 0);
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

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {businesses.map((business) => (
          <BusinessCard key={business.id} business={business} />
        ))}

        {fillers.map((business, index) => (
          <div key={business.id}>
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

        {Array.from({ length: forSale }).map((_, index) => (
          <SlotForSale
            key={`for-sale-${index}`}
            index={businesses.length + fillers.length + index + 1}
          />
        ))}
      </div>
    </section>
  );
}
