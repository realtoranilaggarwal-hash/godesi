import Link from "next/link";
import { type DailySky } from "@/lib/horoscope";
import { RASHIS } from "@/lib/kundliSigns";

export function DailySkyBox({ sky }: { sky: DailySky }) {
  return (
    <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm text-slate-700">
      <p className="font-bold text-slate-900">{sky.dateLabel}</p>
      <ul className="mt-1 space-y-0.5">
        <li>
          🌙 Moon in <b>{RASHIS[sky.moonSign].name}</b> (
          {RASHIS[sky.moonSign].english}), nakshatra <b>{sky.nakshatra}</b>
        </li>
        {sky.nextSign ? (
          <li>
            ➡️ Moves into {RASHIS[sky.nextSign.sign].name} (
            {RASHIS[sky.nextSign.sign].english}) at {sky.nextSign.at} ET; the
            readings change then
          </li>
        ) : null}
        <li>
          📅 {sky.weekday.vaar}, ruled by {sky.weekday.lord}. Lucky colour:{" "}
          {sky.weekday.colour}
        </li>
      </ul>
      <p className="mt-2 text-xs text-slate-500">
        Readings follow the Moon&apos;s transit from your Moon sign (rashi), the
        way Vedic panchangs do. Don&apos;t know your rashi?{" "}
        <Link
          href="/astrology/kundli-calculator"
          className="font-semibold text-violet-700 hover:underline"
        >
          Find it free →
        </Link>
      </p>
    </div>
  );
}
