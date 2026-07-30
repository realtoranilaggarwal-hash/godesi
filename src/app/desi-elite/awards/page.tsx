import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Card, LinkButton } from "@/components/ui";
import { EliteCard } from "@/components/EliteCard";
import { ELITE_ORDER } from "@/lib/elite";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "GoDesi Elite Awards — the annual desi recognition ceremony | Godesi",
  description:
    "Every year Godesi hosts the GoDesi Elite Awards: all nominated candidates are invited and the top Elite members are honoured on stage.",
};

export default async function EliteAwardsPage() {
  const year = new Date().getFullYear();

  const [winners, topElite, nominees] = await Promise.all([
    db.eliteEntry.findMany({
      where: { status: "PUBLISHED", awardTitle: { not: null } },
      orderBy: [{ awardYear: "desc" }, ...ELITE_ORDER],
      take: 24,
    }),
    db.eliteEntry.findMany({
      where: { status: "PUBLISHED", badge: "FEATURED" },
      orderBy: ELITE_ORDER,
      take: 9,
    }),
    db.eliteEntry.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      select: { id: true, slug: true, fullName: true, city: true, category: true },
      take: 60,
    }),
  ]);

  return (
    <div className="space-y-6">
      <Card className="border-amber-300 bg-gradient-to-br from-amber-50 via-white to-rose-50">
        <h1 className="text-2xl font-black sm:text-3xl">🏆 GoDesi Elite Awards</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-700">
          Once a year Godesi hosts the GoDesi Elite Awards. Every nominated
          candidate is invited, and the top Elite members — the founders,
          professionals and community leaders who stood out that year — are
          honoured on stage. Winners keep an award ribbon on their Elite profile.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <LinkButton href="/desi-elite/apply">Apply or nominate</LinkButton>
          <LinkButton
            href="/desi-elite"
            className="bg-white text-slate-900 ring-1 ring-slate-300"
          >
            Elite Directory
          </LinkButton>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Date and venue for the {year} ceremony are announced by email and on{" "}
          <Link href="/events" className="font-semibold underline">
            Godesi events
          </Link>
          . Nominations stay open all year.
        </p>
      </Card>

      {winners.length ? (
        <section className="space-y-3">
          <h2 className="text-xl font-black">🥇 Award winners</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {winners.map((entry) => (
              <EliteCard key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-xl font-black">⭐ Top Elite members</h2>
        <p className="text-sm text-slate-600">
          In line for this year&apos;s awards.
        </p>
        {topElite.length ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {topElite.map((entry) => (
              <EliteCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <Card>
            <p className="text-sm text-slate-600">
              No Elite members published yet —{" "}
              <Link href="/desi-elite/apply" className="font-semibold underline">
                be the first
              </Link>
              .
            </p>
          </Card>
        )}
      </section>

      {nominees.length ? (
        <section className="space-y-3">
          <h2 className="text-xl font-black">🎟️ Everyone invited</h2>
          <Card>
            <ul className="flex flex-wrap gap-2 text-sm">
              {nominees.map((entry) => (
                <li key={entry.id}>
                  <Link
                    href={`/desi-elite/${entry.slug}`}
                    className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-700 hover:border-amber-300 hover:text-amber-800"
                  >
                    {entry.fullName}
                    <span className="font-normal text-slate-500">
                      {" "}
                      · {entry.city}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      ) : null}
    </div>
  );
}
