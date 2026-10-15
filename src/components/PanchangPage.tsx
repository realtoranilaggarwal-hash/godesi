import Link from "next/link";
import { ASTROLOGY_DISCLAIMER } from "@/lib/astrology";
import { PANCHANG_CITIES, type Panchang } from "@/lib/panchang";
import { PanchangCard } from "@/components/PanchangCard";
import { MorningEmailSignup } from "@/components/MorningEmailSignup";

/** Shared body of /astrology/panchang and its per-city pages. */
export function PanchangPage({
  panchang,
  place,
  currentSlug,
}: {
  panchang: Panchang | null;
  place: string;
  currentSlug: string | null;
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <section className="rounded-3xl bg-gradient-to-r from-orange-600 via-amber-500 to-rose-500 px-5 py-7 text-white sm:px-8">
        <Link
          href="/astrology"
          className="text-xs font-semibold uppercase tracking-widest text-white/80 hover:underline"
        >
          ← Astrology
        </Link>
        <h1 className="mt-2 text-3xl font-bold">
          🪔 Today&apos;s Panchang for {place}
        </h1>
        <p className="mt-2 max-w-2xl text-white/90">
          Tithi, nakshatra, yoga, sunrise, Rahu Kaal and today&apos;s fasts and
          festivals, worked out for your city&apos;s own sunrise — free, every
          day.
        </p>
      </section>

      {panchang ? (
        <PanchangCard panchang={panchang} place={place} />
      ) : (
        <p className="text-sm text-slate-600">
          The sun doesn&apos;t rise here today, so there is no sunrise panchang.
        </p>
      )}

      <MorningEmailSignup />

      <section>
        <h2 className="text-sm font-bold text-slate-700">Other cities</h2>
        <ul className="mt-2 flex flex-wrap gap-1.5 text-xs">
          {PANCHANG_CITIES.map((city) => (
            <li key={city.slug}>
              <Link
                href={`/astrology/panchang/${city.slug}`}
                className={`rounded-full border px-3 py-1 font-semibold ${
                  city.slug === currentSlug
                    ? "border-orange-600 bg-orange-600 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {city.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-sm">
        <Link
          href="/astrology/horoscope"
          className="font-semibold text-violet-700 hover:underline"
        >
          Today&apos;s horoscope for every rashi →
        </Link>
      </p>
      <p className="text-xs text-slate-500">{ASTROLOGY_DISCLAIMER}</p>
    </div>
  );
}
