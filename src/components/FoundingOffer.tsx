import Link from "next/link";
import { Card } from "@/components/ui";
import { FOUNDING_LIMIT, FOUNDING_PERKS, foundingSpotsLeft } from "@/lib/founding";

/**
 * Founding-member pitch for signed-out visitors and the rewards page. Hides
 * itself once all thousand seats are taken.
 */
export async function FoundingOffer({ showCta = true }: { showCta?: boolean }) {
  const left = await foundingSpotsLeft();
  if (!left) return null;

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-black text-slate-900">
          🏅 Founding member — first {FOUNDING_LIMIT} only
        </h2>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-orange-700">
          {left} {left === 1 ? "spot" : "spots"} left
        </span>
      </div>
      <ul className="mt-2 space-y-1 text-sm text-slate-700">
        {FOUNDING_PERKS.map((perk) => (
          <li key={perk} className="flex gap-2">
            <span className="text-orange-500">•</span>
            {perk}
          </li>
        ))}
      </ul>
      {showCta ? (
        <Link
          href="/signup"
          className="mt-3 inline-block rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Claim my founding spot — free
        </Link>
      ) : null}
    </Card>
  );
}
