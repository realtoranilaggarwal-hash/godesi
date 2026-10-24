import Link from "next/link";

/**
 * Diagonal promo strip cross-selling the Wall of Fame — shown on the money
 * pages so every ad buyer learns that each dollar buys a brick.
 */
export function WallPromo() {
  return (
    <Link
      href="/walloffame"
      className="block -rotate-1 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-fuchsia-600 px-5 py-3 text-center shadow-lg transition hover:rotate-0 hover:opacity-95"
    >
      <p className="text-sm font-black text-white sm:text-base">
        🧱 New: the Wall of Fame — every $1 buys you a brick forever. Early
        birds get the best spots →
      </p>
    </Link>
  );
}
