import Link from "next/link";
import { type Panchang, panchangTime } from "@/lib/panchang";

const COLOURS = [
  "maroon",
  "saffron",
  "emerald green",
  "royal blue",
  "white",
  "yellow",
  "red",
  "purple",
  "orange",
];

const MOON_SAYS = [
  "A good day to start what you have been putting off.",
  "Keep your wallet closed on impulse buys today.",
  "An old contact brings a new opening — answer that call.",
  "Family talk goes smoother than you fear today.",
  "Double-check before you sign — details matter today.",
  "Help someone quietly; it comes back multiplied.",
  "Short temper, long day — count to ten first.",
  "Travel plans made today tend to stick.",
  "Good day for money talks and clearing dues.",
  "Listen more than you speak — the answer is in the room.",
];

function hash(text: string) {
  let h = 0;
  for (const c of text) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

function span(period: { start: Date; end: Date }, tz: string) {
  return `${panchangTime(period.start, tz)} – ${panchangTime(period.end, tz)}`;
}

/**
 * "Godesi sees today" — a little fortune-teller card driven by the real
 * panchang (tithi, nakshatra, Rahu Kaal, Abhijit muhurat) plus lucky picks
 * that change every day and for every visitor's sky.
 */
export function DailyStars({
  panchang,
  place,
}: {
  panchang: Panchang;
  place: string;
}) {
  const seed = hash(`${panchang.date}-${panchang.tithi.name}`);
  const luckyNumber = (seed % 9) + 1;
  const luckyColour = COLOURS[seed % COLOURS.length];
  const mood = MOON_SAYS[(seed >> 3) % MOON_SAYS.length];
  const tz = panchang.timeZone;

  return (
    <div className="flex items-center gap-2.5 rounded-2xl bg-white/95 px-3 py-2 text-xs text-slate-700 shadow">
      <span
        aria-hidden
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-2xl"
      >
        🔮
      </span>
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-sm font-bold text-slate-900">
            Godesi sees today · {place}
          </span>
          <Link
            href="/astrology/horoscope"
            className="font-semibold text-indigo-600 hover:underline"
          >
            Your horoscope →
          </Link>
        </p>
        <p className="truncate">
          {panchang.tithi.paksha} {panchang.tithi.name} ·{" "}
          {panchang.nakshatra.name} nakshatra ·{" "}
          <span className="italic">{mood}</span>
        </p>
        <p className="truncate">
          <span className="font-semibold">Lucky:</span> {luckyNumber} ·{" "}
          {luckyColour}
          {panchang.abhijit ? (
            <>
              {" "}
              · <span className="font-semibold text-emerald-700">
                golden window:
              </span>{" "}
              {span(panchang.abhijit, tz)}
            </>
          ) : null}{" "}
          · <span className="font-semibold text-rose-700">avoid new starts:</span>{" "}
          {span(panchang.rahuKaal, tz)} (Rahu Kaal)
        </p>
      </div>
    </div>
  );
}
