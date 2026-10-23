import Link from "next/link";
import { db } from "@/lib/db";
import { CONTENT_TTL, cachedQuery } from "@/lib/cache";

const RAIL_SIZE = 12;

const railCards = cachedQuery("home-card-rail", CONTENT_TTL, async () => {
  const now = new Date();
  const select = {
    slug: true,
    name: true,
    category: true,
    city: true,
    logoUrl: true,
    profileType: true,
    featuredRank: true,
    featuredUntil: true,
    owner: { select: { plan: true, planExpiresAt: true } },
  } as const;
  const featuredRows = await db.business.findMany({
    where: {
      status: "APPROVED",
      OR: [
        {
          featuredRank: { gt: 0 },
          OR: [{ featuredUntil: null }, { featuredUntil: { gt: now } }],
        },
        {
          owner: {
            is: {
              plan: { in: ["PRO", "PREMIUM"] },
              planExpiresAt: { gt: now },
            },
          },
        },
      ],
    },
    orderBy: [{ featuredRank: "desc" }, { createdAt: "desc" }],
    take: RAIL_SIZE,
    select,
  });
  const fill = await db.business.findMany({
    where: {
      status: "APPROVED",
      slug: { notIn: featuredRows.map((row) => row.slug) },
    },
    orderBy: { createdAt: "desc" },
    take: RAIL_SIZE - featuredRows.length,
    select,
  });
  return [...featuredRows, ...fill].map((row) => ({
    ...row,
    featured: featuredRows.includes(row),
  }));
});

/**
 * Home-page strip of digital business cards — featured members in gold first,
 * each tile opens the Popl-style card page.
 */
export async function DigitalCardRail() {
  const cards = await railCards();
  if (!cards.length) return null;

  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
          🪪 Digital cards
          <span className="text-xs font-medium text-slate-500">
            tap one to call, WhatsApp or save the contact
          </span>
        </h2>
        <Link
          href="/search"
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
        >
          All cards →
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {cards.map((card) => (
          <Link
            key={card.slug}
            href={`/b/${card.slug}`}
            className={`w-44 shrink-0 rounded-2xl border p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
              card.featured
                ? "border-amber-300 bg-gradient-to-b from-amber-50 to-white ring-1 ring-amber-200"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="h-1 rounded-full bg-gradient-to-r from-orange-400 via-rose-500 to-fuchsia-500" />
            <div className="mt-2 flex items-center gap-2">
              {card.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={card.logoUrl}
                  alt=""
                  className="h-9 w-9 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-lg">
                  {card.profileType === "PROFESSIONAL" ? "🧑‍💼" : "🏪"}
                </span>
              )}
              <div className="min-w-0">
                <p className="line-clamp-2 text-xs font-bold leading-tight text-slate-900">
                  {card.name}
                </p>
                {card.featured ? (
                  <p className="text-[10px] font-black uppercase tracking-wide text-amber-600">
                    ⭐ Featured
                  </p>
                ) : null}
              </div>
            </div>
            <p className="mt-2 line-clamp-1 text-[11px] text-slate-500">
              {card.category}
              {card.city ? ` · ${card.city}` : ""}
            </p>
          </Link>
        ))}
        <Link
          href="/add-business"
          className="flex w-36 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50 p-3 text-center transition hover:bg-rose-100"
        >
          <span className="text-2xl" aria-hidden>
            🪪
          </span>
          <span className="text-xs font-bold text-rose-700">
            Get your free card
          </span>
        </Link>
      </div>
    </section>
  );
}
