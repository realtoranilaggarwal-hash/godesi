import Link from "next/link";
import { featuredBusinesses, searchBusinesses } from "@/lib/businesses";
import { BusinessCard } from "@/components/BusinessCard";
import { PLANS } from "@/lib/plans";

/** Four big cards on top, three below — the strip always shows this many. */
const TOP_ROW = 4;
const STRIP_SIZE = 7;

/** An unsold slot sells itself rather than leaving a hole in the row. */
function SlotForSale({ index, big }: { index: number; big: boolean }) {
  const pro = PLANS.PRO;

  return (
    <Link
      href="/pricing"
      className={`flex flex-col justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-rose-500 to-fuchsia-600 p-5 text-white transition hover:brightness-110 ${
        big ? "min-h-[320px]" : "min-h-[168px]"
      }`}
    >
      <span className="text-xs font-bold uppercase tracking-widest text-white/80">
        Slot {index} of {STRIP_SIZE} · open
      </span>
      <span
        className={`mt-1 font-black leading-tight ${big ? "text-2xl" : "text-base"}`}
      >
        Show your business here
      </span>
      <span className="mt-1 text-sm text-white/90">
        ₹{pro.priceInr} / ${pro.priceUsd.toFixed(2)} a month — your photo at the
        top of the home page and above free listings in search.
      </span>
      <span className="mt-3 text-sm font-bold underline">Take this spot →</span>
    </Link>
  );
}

/**
 * Paid listings lead the strip. Until the slots sell we keep the rows full:
 * recent listings run as a free spotlight, and anything still empty becomes a
 * priced "show your business here" slot instead of white space.
 */
export async function FeaturedStrip({
  categorySlugs,
  title = "Premium businesses",
}: {
  categorySlugs?: string[];
  title?: string;
}) {
  const businesses = (await featuredBusinesses(categorySlugs)).slice(
    0,
    STRIP_SIZE,
  );

  /** One slot always stays on sale, so the offer is visible even when full. */
  const openSlots = Math.max(STRIP_SIZE - businesses.length - 1, 0);
  const fillers = openSlots
    ? (await searchBusinesses({ categorySlugs, take: 24 }))
        .filter((row) => !businesses.some((paid) => paid.id === row.id))
        .slice(0, openSlots)
    : [];

  const forSale = Math.max(STRIP_SIZE - businesses.length - fillers.length, 0);
  const pro = PLANS.PRO;

  /** One list of slots so the 4 + 3 rows always stay full. */
  const slots = [
    ...businesses.map((business) => ({ kind: "paid" as const, business })),
    ...fillers.map((business) => ({ kind: "free" as const, business })),
    ...Array.from({ length: forSale }, () => ({ kind: "sale" as const })),
  ];

  const rows = [
    { items: slots.slice(0, TOP_ROW), big: true },
    { items: slots.slice(TOP_ROW), big: false },
  ];

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

      {rows.map((row, rowIndex) =>
        row.items.length ? (
          <div
            key={rowIndex}
            className={`mt-3 grid gap-3 sm:grid-cols-2 ${
              row.big ? "lg:grid-cols-4" : "lg:grid-cols-3"
            }`}
          >
            {row.items.map((slot, index) => {
              const position = rowIndex * TOP_ROW + index + 1;

              if (slot.kind === "sale") {
                return (
                  <SlotForSale
                    key={`sale-${position}`}
                    index={position}
                    big={row.big}
                  />
                );
              }

              return (
                <div key={slot.business.id} className="flex flex-col">
                  <BusinessCard
                    business={slot.business}
                    variant={
                      slot.kind === "paid"
                        ? "premium"
                        : row.big
                          ? "showcase"
                          : "compact"
                    }
                  />
                  {slot.kind === "free" ? (
                    <Link
                      href="/pricing"
                      className="mt-1 block text-center text-[11px] font-semibold text-slate-400 hover:text-rose-600"
                    >
                      Free spotlight · slot {position} of {STRIP_SIZE} — take it
                      from ₹{pro.priceInr} / ${pro.priceUsd.toFixed(2)} a month →
                    </Link>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null,
      )}
    </section>
  );
}
