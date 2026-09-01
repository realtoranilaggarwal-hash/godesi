import Link from "next/link";
import { searchBusinesses, type BusinessListItem } from "@/lib/businesses";
import { BusinessTile } from "@/components/BusinessTile";
import { PLANS, planRank } from "@/lib/plans";

/** Three cards per trade, so no single category can take over the page. */
const PER_CATEGORY = 3;
/** How many trades get a row before the page turns into a wall of ads. */
const MAX_CATEGORIES = 6;
/** Everyone in a trade takes a turn; the set changes on this clock. */
const ROTATE_MINUTES = 10;

type Group = {
  slug: string | null;
  name: string;
  icon: string | null;
  members: BusinessListItem[];
  paid: number;
};

/**
 * Which slice of a trade is on the home page right now. Everyone waiting gets
 * the same amount of time, and the window moves on its own — so "you will be
 * on the home page in your category" is true for the tenth advertiser as well
 * as the first.
 */
function rotate(members: BusinessListItem[], step: number) {
  if (members.length <= PER_CATEGORY) return members;
  const start = (step * PER_CATEGORY) % members.length;
  return Array.from(
    { length: PER_CATEGORY },
    (_, index) => members[(start + index) % members.length],
  );
}

function spotlightable(row: BusinessListItem) {
  return row.featured || planRank(row.plan) > 0;
}

/**
 * Featured businesses grouped by trade instead of one long strip: a plumber
 * sees plumbers, and every paying member gets home-page time in their own
 * category rather than competing with all 340 services for the same six slots.
 * Unclaimed cards seeded from public data are never spotlighted — nobody asked
 * to be promoted, and it would read as a paid placement.
 */
export async function CategoryFeatured() {
  const rows = await searchBusinesses({ claimedOnly: true, take: 400 });
  const step = Math.floor(Date.now() / (ROTATE_MINUTES * 60_000));

  const groups = new Map<string, Group>();
  for (const row of rows) {
    const name = row.categoryName ?? row.category;
    if (!name) continue;
    const key = row.categorySlug ?? name;
    const group = groups.get(key) ?? {
      slug: row.categorySlug,
      name,
      icon: row.categoryIcon,
      members: [],
      paid: 0,
    };
    group.members.push(row);
    if (spotlightable(row)) group.paid += 1;
    groups.set(key, group);
  }

  // Trades that someone is paying for lead, then the busiest ones.
  const shown = Array.from(groups.values())
    .sort(
      (a, b) => b.paid - a.paid || b.members.length - a.members.length,
    )
    .slice(0, MAX_CATEGORIES);

  if (!shown.length) return null;

  const pro = PLANS.PRO;

  return (
    <section aria-label="Featured businesses by category" className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            ⭐ Featured in your trade
          </h2>
          <p className="text-xs text-slate-500">
            Up to {PER_CATEGORY} businesses per category on the home page, and
            they rotate every {ROTATE_MINUTES} minutes — so every featured
            member gets a turn here, not just the first to pay.
          </p>
        </div>
        <Link
          href="/pricing"
          className="text-sm font-semibold text-rose-600 hover:underline"
        >
          Feature your business here →
        </Link>
      </div>

      {shown.map((group) => {
        const picks = rotate(
          [
            ...group.members.filter(spotlightable),
            ...group.members.filter((row) => !spotlightable(row)),
          ],
          step,
        );
        const waiting = Math.max(group.paid - PER_CATEGORY, 0);

        return (
          <div key={group.slug ?? group.name}>
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-base font-black text-slate-900">
                {group.icon ? `${group.icon} ` : ""}
                {group.slug ? (
                  <Link
                    href={`/categories/${group.slug}`}
                    className="hover:underline"
                  >
                    {group.name}
                  </Link>
                ) : (
                  group.name
                )}
              </h3>
              <p className="text-[11px] font-semibold text-slate-400">
                {waiting
                  ? `${waiting} more featured here — showing in turn`
                  : `Your spot here from ₹${pro.priceInr} / $${pro.priceUsd.toFixed(2)} a month`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {picks.map((business) => (
                <BusinessTile
                  key={business.id}
                  business={business}
                  premium={spotlightable(business)}
                  smallImage
                />
              ))}

              <Link
                  href={`/pricing?category=${encodeURIComponent(group.slug ?? "")}`}
                  className="flex flex-col justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-rose-500 to-fuchsia-600 p-3 text-white transition hover:brightness-110"
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">
                    {group.name} · open
                  </span>
                  <span className="mt-1 text-sm font-black leading-tight">
                    Be featured in {group.name}
                  </span>
                  <span className="mt-1 text-[11px] text-white/90">
                    ₹{pro.priceInr} / ${pro.priceUsd.toFixed(2)} a month — on the
                    home page in your own category.
                  </span>
                <span className="mt-2 text-[11px] font-bold underline">
                  Take this spot →
                </span>
              </Link>
            </div>
          </div>
        );
      })}
    </section>
  );
}
