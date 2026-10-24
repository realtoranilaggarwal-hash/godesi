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

/** Faith-tinted card styles — saffron temples, emerald mosques, sky gurudwaras. */
const FAITH_TINTS: Record<string, { card: string; date: string }> = {
  HINDU_TEMPLE: {
    card: "border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 hover:border-amber-400",
    date: "text-orange-700",
  },
  MOSQUE: {
    card: "border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 hover:border-emerald-400",
    date: "text-emerald-700",
  },
  GURUDWARA: {
    card: "border-sky-300 bg-gradient-to-br from-sky-50 to-blue-50 hover:border-sky-400",
    date: "text-sky-700",
  },
  CHURCH: {
    card: "border-violet-300 bg-gradient-to-br from-violet-50 to-purple-50 hover:border-violet-400",
    date: "text-violet-700",
  },
  JAIN_TEMPLE: {
    card: "border-rose-300 bg-gradient-to-br from-rose-50 to-pink-50 hover:border-rose-400",
    date: "text-rose-700",
  },
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
        <section className="relative overflow-hidden rounded-3xl text-white shadow-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/categories/festivals.jpg"
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-rose-950/85 via-fuchsia-900/60 to-amber-900/30" />
          <div className="relative px-5 py-10 sm:px-8 sm:py-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
            Festival calendar
          </p>
          <h1 className="mt-2 text-3xl font-black drop-shadow sm:text-4xl">
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
          </div>
        </section>

        <FestivalShop
          festivals={upcoming.slice(0, 3)}
          title="Shop for the next festivals"
        />

        {Array.from(byMonth.entries()).map(([month, festivals]) => (
          <Card key={month}>
            <h2 className="mb-3">
              <span className="inline-block rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-3 py-1 text-sm font-black text-white shadow-sm">
                {month}
              </span>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {festivals.map((festival) => {
                const tint =
                  FAITH_TINTS[festival.faith] ?? FAITH_TINTS.HINDU_TEMPLE;
                return (
                <Link
                  key={festival.name}
                  href={`/festivals/${festivalSlug(festival)}`}
                  className={`rounded-2xl border p-3 transition hover:shadow-sm ${tint.card}`}
                >
                  <p className="font-bold">
                    {festival.emoji} {festival.name}{" "}
                    {festival.date.getUTCFullYear()}
                  </p>
                  <p className={`text-sm font-semibold ${tint.date}`}>
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
                );
              })}
            </div>
          </Card>
        ))}
      </div>
      <SidebarBanners />
    </div>
  );
}
