import type { Metadata } from "next";
import Link from "next/link";
import {
  ASTROLOGER_SUBCATEGORIES,
  ASTROLOGY_DISCLAIMER,
} from "@/lib/astrology";
import { searchBusinesses } from "@/lib/businesses";
import { AstrologerList } from "@/components/AstrologerList";
import { SIGN_EMOJI, SIGN_SLUGS, dailySky } from "@/lib/horoscope";
import { RASHIS } from "@/lib/kundliSigns";
import { SidebarBanners } from "@/components/Banners";
import { DailySkyBox } from "@/components/DailySkyBox";
import { HoroscopeCard } from "@/components/HoroscopeCard";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Today's Vedic horoscope for all 12 rashis — free daily rashifal",
  description:
    "Free daily horoscope (rashifal) for Mesha to Meena, worked out from today's Moon transit the Vedic way, with the day's nakshatra and lucky colour.",
  alternates: { canonical: "/astrology/horoscope" },
};

export default async function HoroscopePage() {
  const sky = dailySky();
  const astrologers = await searchBusinesses({
    categorySlugs: ASTROLOGER_SUBCATEGORIES,
    take: 6,
  });
  return (
    <div className="flex justify-center gap-6">
      <div className="min-w-0 max-w-3xl flex-1 space-y-5">
        <section className="rounded-3xl bg-gradient-to-r from-indigo-700 via-violet-600 to-fuchsia-600 px-5 py-8 text-white sm:px-8">
          <Link
            href="/astrology"
            className="text-xs font-semibold uppercase tracking-widest text-white/80 hover:underline"
          >
            ← Astrology guides
          </Link>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Today&apos;s horoscope 🌙
          </h1>
          <p className="mt-3 max-w-2xl text-white/90">
            A free daily rashifal for all 12 Moon signs, from where the Moon is
            today.
          </p>
          <nav className="mt-4 flex flex-wrap gap-1.5 text-sm font-semibold">
            {RASHIS.map((rashi, sign) => (
              <a
                key={rashi.name}
                href={`#${SIGN_SLUGS[sign]}`}
                className="rounded-lg bg-white/15 px-2 py-1 hover:bg-white/25"
              >
                {SIGN_EMOJI[sign]} {rashi.name}
              </a>
            ))}
          </nav>
        </section>

        <DailySkyBox sky={sky} />

        {RASHIS.map((rashi, sign) => (
          <HoroscopeCard key={rashi.name} sign={sign} sky={sky} />
        ))}

        <AstrologerList astrologers={astrologers} />

        <p className="text-xs text-slate-500">{ASTROLOGY_DISCLAIMER}</p>
      </div>
      <SidebarBanners />
    </div>
  );
}
