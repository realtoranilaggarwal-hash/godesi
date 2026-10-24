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
        🧱 List yourself on the Wall of Fame — get seen in Google and Bing.
        Free spots while it launches →
      </p>
    </Link>
  );
}
