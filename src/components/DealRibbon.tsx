import Link from "next/link";

/** Diagonal "Deals" ribbon in the top-right corner of every page; opens the deals page with the Featured special. */
export function DealRibbon() {
  return (
    <div className="pointer-events-none fixed right-0 top-0 z-50 h-16 w-16 overflow-hidden lg:h-24 lg:w-24">
      <Link
        href="/deals#special"
        aria-label="Deals and this month's special"
        className="pointer-events-auto absolute right-[-34px] top-[10px] block w-[120px] rotate-45 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 py-0.5 text-center text-white shadow-md hover:brightness-110 lg:right-[-40px] lg:top-[20px] lg:w-[150px]"
      >
        <span className="block text-[10px] font-black uppercase leading-tight tracking-wide lg:text-xs">
          🔥 Deals
        </span>
        <span className="hidden text-[10px] font-semibold leading-tight lg:block">
          Special inside
        </span>
      </Link>
    </div>
  );
}
