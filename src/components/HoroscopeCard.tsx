import Link from "next/link";
import { Card } from "@/components/ui";
import {
  type DailySky,
  SIGN_EMOJI,
  SIGN_SLUGS,
  readingFor,
} from "@/lib/horoscope";
import { RASHIS } from "@/lib/kundliSigns";

const MOOD = {
  good: { label: "Good day", className: "bg-emerald-100 text-emerald-700" },
  mixed: { label: "Mixed day", className: "bg-amber-100 text-amber-800" },
  careful: { label: "Take care", className: "bg-rose-100 text-rose-700" },
} as const;

export function HoroscopeCard({
  sign,
  sky,
  linkTitle = true,
}: {
  sign: number;
  sky: DailySky;
  linkTitle?: boolean;
}) {
  const reading = readingFor(sign, sky);
  const mood = MOOD[reading.mood];
  const title = (
    <>
      {SIGN_EMOJI[sign]} {RASHIS[sign].english} · {RASHIS[sign].name}
    </>
  );
  return (
    <Card id={SIGN_SLUGS[sign]}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold">
          {linkTitle ? (
            <Link
              href={`/astrology/horoscope/${SIGN_SLUGS[sign]}`}
              className="hover:text-violet-700 hover:underline"
            >
              {title}
            </Link>
          ) : (
            title
          )}
        </h2>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${mood.className}`}
        >
          {mood.label}
        </span>
      </div>
      <p className="mt-1 text-sm font-semibold text-violet-700">
        {reading.headline}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-slate-700">
        {reading.text}
      </p>
      <dl className="mt-2 grid gap-1 text-xs text-slate-600 sm:grid-cols-2">
        <div>
          <dt className="inline font-semibold text-emerald-700">Good for: </dt>
          <dd className="inline">{reading.goodFor}</dd>
        </div>
        <div>
          <dt className="inline font-semibold text-rose-700">Go easy on: </dt>
          <dd className="inline">{reading.goEasy}</dd>
        </div>
      </dl>
    </Card>
  );
}
