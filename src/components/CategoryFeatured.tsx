import Link from "next/link";
import { searchBusinesses, type BusinessListItem } from "@/lib/businesses";
import { BusinessTile } from "@/components/BusinessTile";
import { CategoryArt } from "@/components/CategoryArt";
import { PLANS, planRank } from "@/lib/plans";
import { softFor } from "@/lib/categories";

/** One full row per trade, so no single category can take over the page. */
const PER_CATEGORY = 4;
/** How many trades get a row before the page turns into a wall of ads. */
const MAX_CATEGORIES = 6;
/** Everyone in a trade takes a turn; the set changes on this clock. */
const ROTATE_MINUTES = 10;
/** A trade nobody pays for needs this many claimed cards before it gets a row. */
const MIN_FREE_MEMBERS = 3;
/** Trades kept off the home page until they have enough real cards to show. */
const HIDDEN_ON_HOME = new Set(["home-services"]);

type Group = {
  slug: string | null;
  name: string;
  icon: string | null;
  color: string;
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
    if (row.categorySlug && HIDDEN_ON_HOME.has(row.categorySlug)) continue;
    const key = row.categorySlug ?? name;
    const group = groups.get(key) ?? {
      slug: row.categorySlug,
      name,
      icon: row.categoryIcon,
      color: row.categoryColor ?? "indigo",
      members: [],
      paid: 0,
    };
    group.members.push(row);
    if (spotlightable(row)) group.paid += 1;
    groups.set(key, group);
  }

  // Trades that someone is paying for always get a row; the remaining rows
  // rotate through every other trade so each category takes a turn.
  const sorted = Array.from(groups.values()).sort(
    (a, b) => b.paid - a.paid || b.members.length - a.members.length,
  );
  const paidGroups = sorted
    .filter((group) => group.paid > 0)
    .slice(0, MAX_CATEGORIES);
  const rest = sorted.filter(
    (group) => group.paid === 0 && group.members.length >= MIN_FREE_MEMBERS,
  );
  const openRows = MAX_CATEGORIES - paidGroups.length;
  const restStart = rest.length ? (step * openRows) % rest.length : 0;
  const shown = [
    ...paidGroups,
    ...Array.from(
      { length: Math.min(openRows, rest.length) },
      (_, index) => rest[(restStart + index) % rest.length],
    ),
  ];

  if (!shown.length) return null;

  const pro = PLANS.PRO;

  return (
    <section aria-label="Featured businesses by category" className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2>
            <span className="inline-block rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-4 py-1.5 text-xl font-black text-white shadow-sm">
              ⭐ Featured in your trade
            </span>
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
        // Empty slots get one tile each (category art, the last one the
        // "your spot here" promo) so a sparse row still reads as a full row.
        const openSlots = PER_CATEGORY - picks.length;
        const categoryHref = group.slug
          ? `/categories/${group.slug}`
          : "/categories";
        const pricingHref = `/pricing?category=${encodeURIComponent(group.slug ?? "")}`;
        const fillers = Array.from({ length: openSlots }, (_, index) => {
          const promo = index === openSlots - 1;
          return {
            key: promo ? "promo" : `art-${index}`,
            href: promo ? pricingHref : categoryHref,
            label: promo
              ? `Your spot here starts from $${pro.priceUsd.toFixed(2)} a month →`
              : `More in ${group.name} →`,
            promo,
            // Phones stack one tile per line: show only the first filler there.
            mobileHidden: index > 0,
          };
        });

        return (
          <div key={group.slug ?? group.name}>
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-base font-black text-slate-900">
                {group.slug ? (
                  <Link
                    href={`/categories/${group.slug}`}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 transition hover:shadow-sm ${softFor(group.color)}`}
                  >
                    {group.icon ? `${group.icon} ` : ""}
                    {group.name}
                  </Link>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 ${softFor(group.color)}`}
                  >
                    {group.icon ? `${group.icon} ` : ""}
                    {group.name}
                  </span>
                )}
              </h3>
              {waiting ? (
                <p className="text-[11px] font-semibold text-slate-400">
                  {waiting} more featured here — showing in turn
                </p>
              ) : (
                <Link
                  href={pricingHref}
                  className="text-[11px] font-semibold text-rose-600 hover:underline"
                >
                  Your spot here starts from ${pro.priceUsd.toFixed(2)} a month
                  →
                </Link>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {fillers.map((filler) => (
                <Link
                  key={filler.key}
                  href={filler.href}
                  className={`group flex-col items-center justify-center gap-1 rounded-2xl border bg-white p-2 text-center transition hover:shadow-md ${
                    filler.mobileHidden ? "hidden sm:flex" : "flex"
                  } ${filler.promo ? "border-dashed border-rose-300" : "border-slate-200"}`}
                >
                  <CategoryArt
                    slug={group.slug ?? ""}
                    icon={group.icon ?? undefined}
                    className="h-auto w-full max-w-[240px] rounded-xl"
                  />
                  <span
                    className={`text-xs font-bold ${
                      filler.promo
                        ? "text-rose-600 group-hover:underline"
                        : "text-slate-700 group-hover:text-indigo-700"
                    }`}
                  >
                    {filler.label}
                  </span>
                </Link>
              ))}

              {picks.map((business) => (
                <BusinessTile
                  key={business.id}
                  business={business}
                  premium={spotlightable(business)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
