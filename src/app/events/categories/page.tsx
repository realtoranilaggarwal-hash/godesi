import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Card } from "@/components/ui";
import { gradientFor } from "@/lib/categories";
import {
  EVENT_CATEGORY_GROUPS,
  EVENT_LANGUAGES,
} from "@/lib/eventCategories";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Browse desi events by category",
  description:
    "Garba and dandiya nights, Bollywood concerts, stand-up comedy, satsangs and poojas, food festivals, expos and job fairs — every kind of desi event, by category and by language.",
  alternates: { canonical: "/events/categories" },
};

export default async function EventCategoriesPage() {
  const rows = await db.event.findMany({
    where: { status: "APPROVED", startsAt: { gte: new Date() } },
    select: { genres: true, languages: true },
    take: 1000,
  });

  const genreCounts = new Map<string, number>();
  const languageCounts = new Map<string, number>();
  for (const row of rows) {
    for (const slug of row.genres) {
      genreCounts.set(slug, (genreCounts.get(slug) ?? 0) + 1);
    }
    for (const slug of row.languages) {
      languageCounts.set(slug, (languageCounts.get(slug) ?? 0) + 1);
    }
  }

  return (
    <div className="space-y-6">
      <section
        className={`rounded-3xl bg-gradient-to-r ${gradientFor("rose")} px-5 py-8 text-white sm:px-8`}
      >
        <h1 className="text-3xl font-black">Events by category 🎟️</h1>
        <p className="mt-1 max-w-2xl text-white/90">
          Everything the community puts on — garba nights and Bollywood
          concerts, satsangs and poojas, comedy, expos, job fairs and food
          festivals. Pick a kind of event to see what is coming up.
        </p>
        <Link
          href="/events"
          className="mt-4 inline-block rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-rose-700"
        >
          ← All events
        </Link>
      </section>

      {EVENT_CATEGORY_GROUPS.map((group) => (
        <Card key={group.label}>
          <h2 className="mb-3 text-lg font-bold">{group.label}</h2>
          <div className="flex flex-wrap gap-2">
            {group.options.map((option) => {
              const count = genreCounts.get(option.slug) ?? 0;
              return (
                <Link
                  key={option.slug}
                  href={`/events?genre=${option.slug}`}
                  className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
                    count
                      ? "border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                      : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {option.icon} {option.label}
                  {count ? (
                    <span className="ml-1 font-normal">· {count}</span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </Card>
      ))}

      <Card>
        <h2 className="mb-3 text-lg font-bold">By language</h2>
        <div className="flex flex-wrap gap-2">
          {EVENT_LANGUAGES.map((option) => {
            const count = languageCounts.get(option.slug) ?? 0;
            return (
              <Link
                key={option.slug}
                href={`/events?lang=${option.slug}`}
                className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
                  count
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                {option.label}
                {count ? (
                  <span className="ml-1 font-normal">· {count}</span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </Card>

      <p className="text-sm text-slate-500">
        Putting something on?{" "}
        <Link href="/events/new" className="font-semibold text-indigo-600">
          Post your event free
        </Link>{" "}
        and tick the categories it belongs in.
      </p>
    </div>
  );
}
