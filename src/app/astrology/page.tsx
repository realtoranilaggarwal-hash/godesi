import type { Metadata } from "next";
import Link from "next/link";
import {
  ASTROLOGER_SUBCATEGORIES,
  ASTROLOGY_DISCLAIMER,
  ASTROLOGY_GUIDES,
} from "@/lib/astrology";
import { searchBusinesses } from "@/lib/businesses";
import { AstrologerList } from "@/components/AstrologerList";
import { SidebarBanners } from "@/components/Banners";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Astrology guides and astrologers — kundli, muhurat, Rahu Kaal",
  description:
    "Plain-language guides to Vedic astrology for desis abroad — kundli matching, muhurat, Rahu Kaal, Sade Sati, Vastu — plus astrologers and pandits listed on GoDesi.",
  alternates: { canonical: "/astrology" },
};

export default async function AstrologyPage() {
  const astrologers = await searchBusinesses({
    categorySlugs: ASTROLOGER_SUBCATEGORIES,
    take: 12,
  });

  return (
    <div className="flex justify-center gap-6">
      <div className="min-w-0 max-w-3xl flex-1 space-y-5">
        <section className="rounded-3xl bg-gradient-to-r from-indigo-700 via-violet-600 to-fuchsia-600 px-5 py-8 text-white sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
            Astrology on GoDesi
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Kundli, muhurat and Rahu Kaal, explained 🔮
          </h1>
          <p className="mt-3 max-w-2xl text-white/90">
            Short guides to how desi families use Vedic astrology abroad, and
            the astrologers and pandits you can call when you need one.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold">
            <Link
              href="/astrology/kundli-calculator"
              className="rounded-xl bg-amber-300 px-3 py-2 text-violet-900"
            >
              🔮 Free kundli calculator
            </Link>
            <Link
              href="/astrology/horoscope"
              className="rounded-xl bg-white px-3 py-2 text-violet-700"
            >
              🌙 Today&apos;s horoscope
            </Link>
            <Link
              href="/astrology/panchang"
              className="rounded-xl bg-white px-3 py-2 text-violet-700"
            >
              🪔 Today&apos;s panchang
            </Link>
            <a
              href="#astrologers"
              className="rounded-xl bg-white px-3 py-2 text-violet-700"
            >
              Find an astrologer
            </a>
            <Link
              href="/astrology/how-to-choose-an-astrologer"
              className="rounded-xl border border-white/40 px-3 py-2"
            >
              Avoid astrology scams
            </Link>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-2">
          {ASTROLOGY_GUIDES.map((guide) => (
            <Link
              key={guide.slug}
              href={`/astrology/${guide.slug}`}
              className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-violet-300 hover:shadow-sm"
            >
              <p className="text-2xl">{guide.emoji}</p>
              <p className="mt-1 font-bold text-slate-900">{guide.title}</p>
              <p className="mt-1 line-clamp-3 text-sm text-slate-600">
                {guide.description}
              </p>
              <p className="mt-2 text-xs font-bold text-violet-600">
                Read the guide →
              </p>
            </Link>
          ))}
        </div>

        <AstrologerList astrologers={astrologers} />

        <p className="text-xs text-slate-500">{ASTROLOGY_DISCLAIMER}</p>
      </div>
      <SidebarBanners />
    </div>
  );
}
