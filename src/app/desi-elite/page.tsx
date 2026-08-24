import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Card, LinkButton, inputClass } from "@/components/ui";
import { EliteCard } from "@/components/EliteCard";
import { ProfessionalCard } from "@/components/ProfessionalCard";
import {
  newestProfessionals,
  professionalCount,
} from "@/lib/professionalsQueries";
import { ELITE_CATEGORIES, ELITE_ORDER, eliteWhere } from "@/lib/elite";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "GoDesi Elite — recognised desi leaders, founders and professionals",
  description:
    "The GoDesi Elite directory: featured, premium and member profiles of desi entrepreneurs, professionals and community leaders, with interviews and video.",
};

export default async function EliteDirectoryPage({
  searchParams,
}: {
  searchParams: { category?: string; city?: string; country?: string; badge?: string; q?: string };
}) {
  const where = eliteWhere(searchParams);
  const [entries, professionals, professionalTotal] = await Promise.all([
    db.eliteEntry.findMany({
      where,
      orderBy: [{ badge: "desc" }, ...ELITE_ORDER],
      take: 200,
    }),
    newestProfessionals(6),
    professionalCount(),
  ]);

  const featured = entries.filter((entry) => entry.badge === "FEATURED");
  const premium = entries.filter((entry) => entry.badge === "PREMIUM");
  const basic = entries.filter((entry) => entry.badge === "BASIC");

  return (
    <div className="space-y-6">
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 via-white to-rose-50">
        <h1 className="text-2xl font-black sm:text-3xl">🏆 GoDesi Elite</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-700">
          Recognition for desi entrepreneurs, professionals and community leaders
          worldwide. Apply or nominate someone — our team reviews the entry,
          interviews them and publishes a profile with video. Some profiles are
          written by us from public record and marked <b>unclaimed</b> until the
          person takes theirs over. Not ready for that? Completing your profile
          lists you free in{" "}
          <Link href="/professionals" className="font-bold underline">
            GoDesi Professionals
          </Link>{" "}
          straight away.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <LinkButton href="/desi-elite/apply">Apply now</LinkButton>
          <LinkButton
            href="/desi-elite/apply?nominate=other"
            className="bg-white text-slate-900 ring-1 ring-slate-300"
          >
            Nominate someone
          </LinkButton>
          <LinkButton
            href="/desi-elite/awards"
            className="bg-white text-slate-900 ring-1 ring-slate-300"
          >
            🏆 Elite Awards
          </LinkButton>
          <Link
            href="/desi-elite/rss"
            className="self-center text-sm font-semibold text-slate-500 hover:underline"
          >
            RSS
          </Link>
        </div>
      </Card>

      <form className="grid gap-2 sm:grid-cols-5" action="/desi-elite">
        <input
          name="q"
          defaultValue={searchParams.q ?? ""}
          placeholder="Search name or work"
          className={inputClass}
        />
        <select name="category" defaultValue={searchParams.category ?? ""} className={inputClass}>
          <option value="">All categories</option>
          {ELITE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <input
          name="city"
          defaultValue={searchParams.city ?? ""}
          placeholder="City"
          className={inputClass}
        />
        <select name="badge" defaultValue={searchParams.badge ?? ""} className={inputClass}>
          <option value="">All members</option>
          <option value="FEATURED">Featured only</option>
          <option value="PREMIUM">Premium only</option>
        </select>
        <button
          type="submit"
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white"
        >
          Filter
        </button>
      </form>

      {!entries.length ? (
        <Card>
          <p className="text-sm text-slate-600">
            No published profiles match yet — be the first.{" "}
            <Link href="/desi-elite/apply" className="font-bold text-indigo-600 underline">
              Apply for GoDesi Elite
            </Link>
            .
          </p>
        </Card>
      ) : null}

      {featured.length ? (
        <section>
          <h2 className="mb-3 text-lg font-black text-slate-900">⭐ Featured Elite Members</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {featured.map((entry) => (
              <EliteCard key={entry.id} entry={entry} size="large" />
            ))}
          </div>
        </section>
      ) : null}

      {premium.length ? (
        <section>
          <h2 className="mb-3 text-lg font-black text-slate-900">💎 Premium Members</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {premium.map((entry) => (
              <EliteCard key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      ) : null}

      {basic.length ? (
        <section>
          <h2 className="mb-3 text-lg font-black text-slate-900">📂 Elite Directory</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {basic.map((entry) => (
              <EliteCard key={entry.id} entry={entry} size="small" />
            ))}
          </div>
        </section>
      ) : null}

      {professionals.length ? (
        <section>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                👔 GoDesi Professionals — free, and growing on its own
              </h2>
              <p className="text-sm text-slate-600">
                Every member who completes their profile is listed, no review
                needed. Elite above is the reviewed recognition.
              </p>
            </div>
            <Link
              href="/professionals"
              className="text-sm font-bold text-indigo-600 hover:underline"
            >
              All {professionalTotal.toLocaleString()} professionals →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {professionals.map((person) => (
              <ProfessionalCard key={person.id} person={person} />
            ))}
          </div>
        </section>
      ) : null}

      <Card className="border-indigo-200 bg-indigo-50">
        <p className="text-sm font-semibold text-indigo-900">
          Want the top spot? Featured and Premium recognition includes video, contact
          buttons and placement above the directory.
        </p>
        <LinkButton href="/pricing" className="mt-3">
          See membership plans
        </LinkButton>
      </Card>

      <p className="text-center text-xs text-slate-500">
        These profiles also appear on{" "}
        <a
          href="https://desiwhoswho.com"
          target="_blank"
          rel="noopener"
          className="font-semibold underline"
        >
          desiwhoswho.com
        </a>
        , Godesi&apos;s who&apos;s who of desi America.
      </p>
    </div>
  );
}
