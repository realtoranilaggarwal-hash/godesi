import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ASTROLOGER_SUBCATEGORIES,
  ASTROLOGY_DISCLAIMER,
} from "@/lib/astrology";
import { searchBusinesses } from "@/lib/businesses";
import {
  SIGN_EMOJI,
  SIGN_SLUGS,
  dailySky,
  signFromSlug,
} from "@/lib/horoscope";
import { RASHIS } from "@/lib/kundliSigns";
import { AstrologerList } from "@/components/AstrologerList";
import { AstrologyShop } from "@/components/AstrologyShop";
import { DEFAULT_ASTRO_SHOP, astroShopItemsById } from "@/lib/astrologyShop";
import { SidebarBanners } from "@/components/Banners";
import { DailySkyBox } from "@/components/DailySkyBox";
import { HoroscopeCard } from "@/components/HoroscopeCard";

export const revalidate = 600;

export function generateStaticParams() {
  return SIGN_SLUGS.map((sign) => ({ sign }));
}

export function generateMetadata({
  params,
}: {
  params: { sign: string };
}): Metadata {
  const sign = signFromSlug(params.sign);
  if (sign === null) return { title: "Horoscope not found" };
  const { english, name } = RASHIS[sign];
  return {
    title: `${english} (${name}) horoscope today — free Vedic rashifal`,
    description: `Today's ${english} / ${name} horoscope from the Moon's transit, the Vedic way: what the day is good for, what to go easy on, the nakshatra and lucky colour.`,
    alternates: { canonical: `/astrology/horoscope/${params.sign}` },
  };
}

export default async function SignHoroscopePage({
  params,
}: {
  params: { sign: string };
}) {
  const sign = signFromSlug(params.sign);
  if (sign === null) notFound();
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
            href="/astrology/horoscope"
            className="text-xs font-semibold uppercase tracking-widest text-white/80 hover:underline"
          >
            ← All 12 rashis
          </Link>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            {SIGN_EMOJI[sign]} {RASHIS[sign].english} ({RASHIS[sign].name})
            horoscope today
          </h1>
        </section>

        <DailySkyBox sky={sky} />
        <HoroscopeCard sign={sign} sky={sky} linkTitle={false} />

        <nav className="flex flex-wrap gap-1.5 text-sm">
          {RASHIS.map((rashi, index) =>
            index === sign ? null : (
              <Link
                key={rashi.name}
                href={`/astrology/horoscope/${SIGN_SLUGS[index]}`}
                className="rounded-lg border border-violet-200 px-2 py-1 text-violet-700 hover:bg-violet-50"
              >
                {SIGN_EMOJI[index]} {rashi.english}
              </Link>
            ),
          )}
        </nav>

        <AstrologyShop items={astroShopItemsById(DEFAULT_ASTRO_SHOP)} />
        <AstrologerList astrologers={astrologers} />

        <p className="text-xs text-slate-500">{ASTROLOGY_DISCLAIMER}</p>
      </div>
      <SidebarBanners />
    </div>
  );
}
