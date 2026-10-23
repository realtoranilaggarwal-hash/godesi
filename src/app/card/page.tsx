import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { inputClass, LinkButton } from "@/components/ui";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Digital business cards — desi businesses",
  description:
    "Browse shareable digital business cards of desi businesses and professionals — open a card, save the contact, or share yours free.",
};

const PAGE_SIZE = 48;

export default async function CardsDirectoryPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const q = (searchParams.q ?? "").trim();
  const page = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);

  const where = {
    status: "APPROVED" as const,
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { category: { contains: q, mode: "insensitive" as const } },
            { city: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [businesses, total] = await Promise.all([
    db.business.findMany({
      where,
      orderBy: [{ featuredRank: "desc" }, { name: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        slug: true,
        name: true,
        category: true,
        city: true,
        state: true,
        logoUrl: true,
        profileType: true,
        verifiedProvider: true,
        featuredRank: true,
        featuredUntil: true,
      },
    }),
    db.business.count({ where }),
  ]);
  const now = new Date();
  const pages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            🪪 Digital cards
          </h1>
          <p className="text-sm text-slate-600">
            Tap a card to open it — call, WhatsApp, save the contact or share
            your details.
          </p>
        </div>
        <LinkButton href="/add-business">Get your free card</LinkButton>
      </div>

      <form method="GET" className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name, business type or city…"
          className={inputClass}
        />
        <button
          type="submit"
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Search
        </button>
      </form>

      {businesses.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {businesses.map((business) => {
            const featured =
              business.featuredRank > 0 &&
              (!business.featuredUntil || business.featuredUntil > now);
            return (
              <Link
                key={business.slug}
                href={`/card/${business.slug}`}
                className={`flex flex-col items-center rounded-2xl border p-4 text-center shadow-sm transition hover:shadow-md ${
                  featured
                    ? "border-amber-300 bg-gradient-to-b from-amber-50 to-white"
                    : "border-slate-200 bg-white"
                }`}
              >
                {business.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={business.logoUrl}
                    alt=""
                    className="h-14 w-14 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-100 text-2xl">
                    {business.profileType === "PROFESSIONAL" ? "🧑‍💼" : "🏪"}
                  </div>
                )}
                <p className="mt-2 line-clamp-2 text-sm font-bold text-slate-900">
                  {business.name}
                </p>
                <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                  {business.category}
                  {business.city ? ` · ${business.city}` : ""}
                </p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  {featured ? (
                    <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                      ⭐ FEATURED
                    </span>
                  ) : null}
                  {business.verifiedProvider ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      ✓ Verified
                    </span>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          No cards match “{q}”. Try another search.
        </p>
      )}

      {pages > 1 ? (
        <div className="flex items-center justify-center gap-3 text-sm">
          {page > 1 ? (
            <Link
              href={`/card?${new URLSearchParams({ ...(q ? { q } : {}), page: String(page - 1) })}`}
              className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50"
            >
              ← Prev
            </Link>
          ) : null}
          <span className="text-slate-500">
            Page {page} of {pages}
          </span>
          {page < pages ? (
            <Link
              href={`/card?${new URLSearchParams({ ...(q ? { q } : {}), page: String(page + 1) })}`}
              className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Next →
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
