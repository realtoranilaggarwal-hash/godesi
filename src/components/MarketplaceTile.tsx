import Link from "next/link";

const PICKS = ["Jewellery & gold", "Furniture"];

/** Fills a spare cell in the category grid with the buy & sell marketplace. */
export function MarketplaceTile() {
  return (
    <Link
      href="/marketplace"
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-2 text-white">
        <span className="text-xl" aria-hidden>
          🛍️
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold leading-tight">Buy &amp; sell</p>
          <p className="text-[11px] text-white/80">
            Sell anything to the desi community
          </p>
        </div>
      </div>
      <div className="p-3">
        <div className="flex flex-wrap gap-1.5">
          {PICKS.map((pick) => (
            <span
              key={pick}
              className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-700"
            >
              {pick}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
