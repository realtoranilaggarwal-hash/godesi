import Link from "next/link";
import { featuredBusinesses, searchBusinesses } from "@/lib/businesses";
import { BusinessTile } from "@/components/BusinessTile";
import { PLANS } from "@/lib/plans";

/** Six to a row, up to three rows, so a full strip still fits above the fold. */
const ROW = 6;
const MAX_SLOTS = ROW * 3;

/** An unsold slot sells itself rather than leaving a hole in the row. */
function SlotForSale({ index, total }: { index: number; total: number }) {
  const pro = PLANS.PRO;

  return (
    <Link
      href="/pricing"
      className="flex flex-col justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-rose-500 to-fuchsia-600 p-3 text-white transition hover:brightness-110"
    >
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">
        Slot {index} of {total} · open
      </span>
      <span className="mt-1 text-base font-black leading-tight">
        Show your business here
      </span>
      <span className="mt-1 text-xs text-white/90">
        ₹{pro.priceInr} / ${pro.priceUsd.toFixed(2)} a month — your photo at the
        top of the home page.
      </span>
      <span className="mt-2 text-xs font-bold underline">Take this spot →</span>
    </Link>
  );
}

/**
 * Paid listings lead the strip. Until the slots sell, cards a member has
 * claimed run as a free spotlight and the rest of the row is offered for sale.
 * An unclaimed card seeded from public data is never spotlighted — nobody has
 * asked to be promoted, and it would read as a paid placement.
 */
export async function FeaturedStrip({
  categorySlugs,
  title = "Premium businesses",
}: {
  categorySlugs?: string[];
  title?: string;
}) {
  const businesses = (await featuredBusinesses(categorySlugs, MAX_SLOTS)).slice(
    0,
    MAX_SLOTS,
  );

  /** Round up to whole rows so the grid never ends ragged. */
  const total = Math.min(
    Math.max(Math.ceil((businesses.length + 1) / ROW) * ROW, ROW),
    MAX_SLOTS,
  );

  const openSlots = Math.max(total - businesses.length - 1, 0);
  const fillers = openSlots
    ? (await searchBusinesses({
        categorySlugs,
        claimedOnly: true,
        take: MAX_SLOTS * 2,
      }))
        .filter((row) => !businesses.some((paid) => paid.id === row.id))
        .slice(0, openSlots)
    : [];

  const forSale = Math.max(total - businesses.length - fillers.length, 0);
  const pro = PLANS.PRO;

  return (
    <section aria-label={title}>
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900">⭐ {title}</h2>
          <p className="text-xs text-slate-500">
            Verified paid members — they appear here and above free listings.
          </p>
        </div>
        <Link
          href="/pricing"
          className="text-sm font-semibold text-rose-600 hover:underline"
        >
          Feature your business here →
        </Link>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {businesses.map((business) => (
          <BusinessTile key={business.id} business={business} premium />
        ))}

        {fillers.map((business, index) => (
          <div key={business.id} className="flex flex-col">
            <div className="flex-1">
              <BusinessTile business={business} />
            </div>
            <Link
              href="/pricing"
              className="mt-1 block text-center text-[10px] font-semibold text-slate-400 hover:text-rose-600"
            >
              Free spotlight · slot {businesses.length + index + 1} of {total} —
              take it from ₹{pro.priceInr} / ${pro.priceUsd.toFixed(2)} a month →
            </Link>
          </div>
        ))}

        {Array.from({ length: forSale }).map((_, index) => (
          <SlotForSale
            key={`for-sale-${index}`}
            index={businesses.length + fillers.length + index + 1}
            total={total}
          />
        ))}
      </div>
    </section>
  );
}
