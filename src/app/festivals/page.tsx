import type { Metadata } from "next";
import Link from "next/link";
import { FAITH_LABELS } from "@/lib/worship";
import {
  FESTIVALS,
  festivalSlug,
  formatFestivalDate,
  upcomingFestivals,
} from "@/lib/festivals";
import { SidebarBanners } from "@/components/Banners";
import { FestivalShop } from "@/components/FestivalShop";
import { Card, LinkButton } from "@/components/ui";

export const revalidate = 3600;

export const metadata: Metadata = {
  title:
    "Desi festival calendar — Diwali, Navratri, Holi, Eid dates in the USA",
  description:
    "When is Diwali, Navratri, Holi, Eid, Baisakhi or Gurpurab this year? Every South Asian festival date for the next three years, with garba nights, pujas and melas near you.",
  alternates: { canonical: "/festivals" },
};

const MONTH = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export default function FestivalsPage() {
  const upcoming = upcomingFestivals(FESTIVALS.length);
  const byMonth = new Map<string, typeof upcoming>();
  for (const festival of upcoming) {
    const key = MONTH.format(festival.date);
    byMonth.set(key, [...(byMonth.get(key) ?? []), festival]);
  }

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-5">
        <section className="rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-5 py-8 text-white sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
            Festival calendar
          </p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            Every desi festival, and what is on near you 🪔
          </h1>
          <p className="mt-3 max-w-2xl text-white/90">
            Dates for the next twelve months, then each festival&apos;s page
            lists the garba nights, pujas, melas and parties posted on GoDesi.
            Lunar dates move every year; US dates can differ from India by a
            day, so confirm with your temple.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <LinkButton href="/events/new" variant="secondary">
              Post your festival event free
            </LinkButton>
            <LinkButton href="/religious" variant="secondary">
              Temples & gurudwaras near you
            </LinkButton>
          </div>
        </section>

        <FestivalShop
          festivals={upcoming.slice(0, 3)}
          title="Shop for the next festivals"
        />

        {Array.from(byMonth.entries()).map(([month, festivals]) => (
          <Card key={month}>
            <h2 className="mb-3 font-bold">{month}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {festivals.map((festival) => (
                <Link
                  key={festival.name}
                  href={`/festivals/${festivalSlug(festival)}`}
                  className="rounded-2xl border border-amber-200 bg-gradient-to-br from-white to-amber-50 p-3 transition hover:border-amber-400 hover:shadow-sm"
                >
                  <p className="font-bold">
                    {festival.emoji} {festival.name}{" "}
                    {festival.date.getUTCFullYear()}
                  </p>
                  <p className="text-sm font-semibold text-amber-700">
                    {formatFestivalDate(festival.date)}
                    {festival.daysAway === 0
                      ? " · today"
                      : ` · in ${festival.daysAway} day${festival.daysAway === 1 ? "" : "s"}`}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {festival.blurb}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {FAITH_LABELS[festival.faith]}
                  </p>
                </Link>
              ))}
            </div>
          </Card>
        ))}
      </div>
      <SidebarBanners />
    </div>
  );
}
