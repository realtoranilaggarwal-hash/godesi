import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  AUTO_RELEASE_DAYS,
  GIG_FEE_USD,
  GIG_MAX_USD,
  GIG_MIN_USD,
  GIG_SELECT,
} from "@/lib/gigs";
import { GigCard } from "@/components/gigs/GigCard";
import { EmptyState, LinkButton, inputClass } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gigs — small jobs by desi experts, $5 to $100",
  description:
    "Hire a desi expert for a fixed price: kundli reading, resume review, logo, tax questions, tutoring. Pay through Godesi, money released only when you are happy.",
  alternates: { canonical: "/gigs" },
};

export default async function GigsPage({
  searchParams,
}: {
  searchParams: { q?: string; tag?: string };
}) {
  const q = (searchParams.q ?? "").trim().slice(0, 80);
  const tag = (searchParams.tag ?? "").trim().toLowerCase().slice(0, 30);
  const [gigs, user] = await Promise.all([
    db.gig.findMany({
      where: {
        status: "ACTIVE",
        ...(tag ? { tags: { has: tag } } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
                { tags: { has: q.toLowerCase() } },
                { seller: { name: { contains: q, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      orderBy: [{ ratingCount: "desc" }, { createdAt: "desc" }],
      take: 120,
      select: GIG_SELECT,
    }),
    getCurrentUser(),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-white/70">
          Gigs
        </p>
        <h1 className="mt-1 text-3xl font-black sm:text-4xl">
          Small jobs by desi experts, ${GIG_MIN_USD} to ${GIG_MAX_USD}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-white/90">
          A kundli read, a resume fixed, a logo, a tax question answered, an hour
          of tutoring. Pay here, not on WhatsApp: Godesi holds the money and the
          seller is paid only when you say the work is done (or {AUTO_RELEASE_DAYS}{" "}
          days after delivery). Godesi keeps a flat ${GIG_FEE_USD} — the card
          processor takes most of that.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <LinkButton
            href={user ? "/dashboard/gigs" : "/login?next=/dashboard/gigs"}
            variant="secondary"
          >
            🛠️ Sell your expertise
          </LinkButton>
          <Link
            href="/gigs/how-it-works"
            className="inline-flex items-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white underline"
          >
            How the money works
          </Link>
        </div>
      </section>

      <form className="flex gap-2" action="/gigs">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search gigs — astrology, resume, logo, tax, tutoring…"
          className={inputClass}
        />
        <button
          type="submit"
          className="rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white"
        >
          Search
        </button>
      </form>

      {tag ? (
        <p className="text-sm text-slate-600">
          Tagged <strong>{tag}</strong> ·{" "}
          <Link href="/gigs" className="underline">
            show all
          </Link>
        </p>
      ) : null}

      {gigs.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {gigs.map((gig) => (
            <GigCard key={gig.slug} gig={gig} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={q || tag ? `No gigs match “${q || tag}”` : "No gigs yet"}
          body="Be the first: list what you can do for a fixed price and it appears here and on your card."
        />
      )}
    </div>
  );
}
