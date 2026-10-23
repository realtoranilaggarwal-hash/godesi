import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { effectivePlan } from "@/lib/plans";
import { inputClass, LinkButton } from "@/components/ui";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Digital business cards — desi businesses",
  description:
    "Browse shareable digital business cards of desi businesses and professionals — open a card, save the contact, or share yours free.",
};

const PAGE_SIZE = 48;
const FEATURED_TAKE = 8;
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const CARD_SELECT = {
  id: true,
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
  owner: { select: { plan: true, planExpiresAt: true } },
} satisfies Prisma.BusinessSelect;

type CardRow = Prisma.BusinessGetPayload<{ select: typeof CARD_SELECT }>;

function isFeatured(card: CardRow, now: Date) {
  return (
    (card.featuredRank > 0 &&
      (!card.featuredUntil || card.featuredUntil > now)) ||
    (card.owner ? effectivePlan(card.owner) !== "FREE" : false)
  );
}

function cardHref(params: Record<string, string>) {
  const search = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value),
  );
  const query = search.toString();
  return `/card${query ? `?${query}` : ""}`;
}

function CardTile({ card, featured }: { card: CardRow; featured: boolean }) {
  return (
    <Link
      href={`/card/${card.slug}`}
      className={`flex flex-col items-center rounded-2xl border p-4 text-center shadow-sm transition hover:shadow-md ${
        featured
          ? "border-amber-300 bg-gradient-to-b from-amber-50 to-white ring-1 ring-amber-200"
          : "border-slate-200 bg-white"
      }`}
    >
      {card.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={card.logoUrl}
          alt=""
          className={`h-14 w-14 rounded-xl object-cover ${
            featured ? "ring-2 ring-amber-400 ring-offset-2" : ""
          }`}
        />
      ) : (
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-xl text-2xl ${
            featured ? "bg-amber-100" : "bg-indigo-100"
          }`}
        >
          {card.profileType === "PROFESSIONAL" ? "🧑‍💼" : "🏪"}
        </div>
      )}
      <p className="mt-2 line-clamp-2 text-sm font-bold text-slate-900">
        {card.name}
      </p>
      <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
        {card.category}
        {card.city ? ` · ${card.city}` : ""}
      </p>
      <div className="mt-1.5 flex items-center gap-1.5">
        {featured ? (
          <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-900">
            ⭐ FEATURED
          </span>
        ) : null}
        {card.verifiedProvider ? (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
            ✓ Verified
          </span>
        ) : null}
      </div>
    </Link>
  );
}

export default async function CardsDirectoryPage({
  searchParams,
}: {
  searchParams: {
    q?: string;
    cat?: string;
    letter?: string;
    loc?: string;
    page?: string;
  };
}) {
  const q = (searchParams.q ?? "").trim();
  const cat = (searchParams.cat ?? "").trim();
  const letter = (searchParams.letter ?? "").trim().slice(0, 1).toUpperCase();
  const loc = (searchParams.loc ?? "").trim();
  const page = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);
  const now = new Date();

  const and: Prisma.BusinessWhereInput[] = [];
  if (q) {
    and.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
      ],
    });
  }
  if (letter) {
    and.push({ name: { startsWith: letter, mode: "insensitive" } });
  }
  if (cat) {
    and.push({
      OR: [
        { categorySlug: cat },
        { subcategorySlug: cat },
        { categoryRef: { is: { parentSlug: cat } } },
        { subcategoryRef: { is: { parentSlug: cat } } },
      ],
    });
  }
  if (loc) {
    and.push({
      OR: [
        { city: { contains: loc, mode: "insensitive" } },
        { state: { contains: loc, mode: "insensitive" } },
      ],
    });
  }

  const featuredCond: Prisma.BusinessWhereInput = {
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
  };

  const [categories, featured] = await Promise.all([
    db.category.findMany({
      where: { parentSlug: null },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { slug: true, name: true, icon: true },
    }),
    db.business.findMany({
      where: { status: "APPROVED", AND: [...and, featuredCond] },
      orderBy: [{ featuredRank: "desc" }, { name: "asc" }],
      take: FEATURED_TAKE,
      select: CARD_SELECT,
    }),
  ]);

  const featuredIds = featured.map((card) => card.id);
  const restWhere: Prisma.BusinessWhereInput = {
    status: "APPROVED",
    AND: [...and, { id: { notIn: featuredIds } }],
  };
  const [businesses, total] = await Promise.all([
    db.business.findMany({
      where: restWhere,
      orderBy: [{ name: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: CARD_SELECT,
    }),
    db.business.count({ where: restWhere }),
  ]);
  const pages = Math.ceil(total / PAGE_SIZE);
  const filters = { q, cat, letter, loc };

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

      {/* Filters: name/profession, category, location */}
      <form method="GET" className="grid gap-2 sm:grid-cols-[1fr_auto_1fr_auto]">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name or profession…"
          className={inputClass}
        />
        <select name="cat" defaultValue={cat} className={inputClass}>
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.icon} {category.name}
            </option>
          ))}
        </select>
        <input
          name="loc"
          defaultValue={loc}
          placeholder="City or state…"
          className={inputClass}
        />
        <button
          type="submit"
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Search
        </button>
      </form>

      {/* A–Z letter bar */}
      <div className="flex flex-wrap items-center gap-1">
        <Link
          href={cardHref({ q, cat, loc, letter: "" })}
          className={`rounded-lg px-2 py-1 text-xs font-bold ${
            !letter
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          All
        </Link>
        {LETTERS.map((item) => (
          <Link
            key={item}
            href={cardHref({ q, cat, loc, letter: item })}
            className={`rounded-lg px-2 py-1 text-xs font-bold ${
              letter === item
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {item}
          </Link>
        ))}
      </div>

      {featured.length ? (
        <section>
          <h2 className="mb-2 text-sm font-black uppercase tracking-wide text-amber-700">
            ⭐ Featured members
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((card) => (
              <CardTile key={card.slug} card={card} featured />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        {featured.length ? (
          <h2 className="mb-2 text-sm font-black uppercase tracking-wide text-slate-500">
            All cards
          </h2>
        ) : null}
        {businesses.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {businesses.map((card) => (
              <CardTile
                key={card.slug}
                card={card}
                featured={isFeatured(card, now)}
              />
            ))}
          </div>
        ) : featured.length ? null : (
          <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            No cards match those filters. Try another name, category or city.
          </p>
        )}
      </section>

      {pages > 1 ? (
        <div className="flex items-center justify-center gap-3 text-sm">
          {page > 1 ? (
            <Link
              href={cardHref({ ...filters, page: String(page - 1) })}
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
              href={cardHref({ ...filters, page: String(page + 1) })}
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
