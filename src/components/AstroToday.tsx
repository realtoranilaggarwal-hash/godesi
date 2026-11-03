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

const ZODIAC = "♈♉♊♋♌♍♎♏♐♑♒♓".split("");

const ASTRO_LINKS = [
  { href: "/astrology/panchang", label: "🪔 Full Panchang" },
  { href: "/astrology/horoscope", label: "🔮 Your horoscope" },
  { href: "/astrology/kundli-calculator", label: "📜 Free Kundli" },
  {
    href: "/astrology/kundli-matching-for-marriage",
    label: "💞 Kundli matching",
  },
  {
    href: "/categories/religious-services-astrologers",
    label: "🧑‍🏫 Find an astrologer",
  },
  { href: "/festivals", label: "🎉 Festivals" },
  { href: "/pooja", label: "🙏 Book a pooja" },
  { href: "/astrology", label: "✨ All astrology" },
];

/**
 * Home-page astrology box: today's panchang for the visitor's city, the
 * "Godesi sees today" fortune (lucky picks that change daily) and links to
 * every astrology page, behind a slowly turning zodiac wheel.
 */
export function AstroToday({
  panchang,
  place,
}: {
  panchang: Panchang;
  place: string;
}) {
  const seed = hash(`${panchang.date}-${panchang.tithi.name}`);
  const luckyNumber = (seed % 9) + 1;
  const luckyColour = COLOURS[seed % COLOURS.length];
  const mood = MOON_SAYS[(seed >>> 3) % MOON_SAYS.length];
  const tz = panchang.timeZone;

  return (
    <section className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-violet-50 px-3 py-2.5 text-xs text-slate-700">
      <div className="flex items-center gap-3">
        <Link
          href="/astrology"
          aria-label="Astrology on GoDesi"
          className="relative flex h-16 w-16 shrink-0 items-center justify-center"
        >
          <span
            aria-hidden
            className="absolute inset-0 animate-spin rounded-full bg-gradient-to-br from-violet-200 via-amber-100 to-orange-200 [animation-duration:24s] motion-reduce:animate-none"
          >
            {ZODIAC.map((sign, index) => (
              <span
                key={sign}
                className="absolute left-1/2 top-1/2 -ml-1.5 -mt-2 w-3 text-center text-[10px] leading-4 text-violet-700"
                style={{
                  transform: `rotate(${index * 30}deg) translateY(-26px)`,
                }}
              >
                {`${sign}\uFE0E`}
              </span>
            ))}
          </span>
          <span
            aria-hidden
            className="relative flex h-9 w-9 animate-pulse items-center justify-center rounded-full bg-white text-xl shadow motion-reduce:animate-none"
          >
            🔮
          </span>
        </Link>
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="flex flex-wrap items-baseline gap-x-2">
            <Link
              href="/astrology"
              className="text-sm font-bold text-slate-900 hover:underline"
            >
              Astrology &amp; Panchang today · {place}
            </Link>
            <span className="text-slate-500">{panchang.vaar}</span>
          </p>
          <p className="sm:truncate">
            {panchang.observances.length ? (
              <span className="font-semibold text-orange-800">
                🙏 {panchang.observances.join(" · ")} ·{" "}
              </span>
            ) : null}
            <span className="font-semibold">Tithi:</span>{" "}
            {panchang.tithi.paksha} {panchang.tithi.name} ·{" "}
            <span className="font-semibold">Nakshatra:</span>{" "}
            {panchang.nakshatra.name} · 🌅 {panchangTime(panchang.sunrise, tz)}{" "}
            / {panchangTime(panchang.sunset, tz)}
          </p>
          <p className="sm:truncate">
            <span className="font-semibold text-rose-700">⛔ Rahu Kaal:</span>{" "}
            {span(panchang.rahuKaal, tz)}
            {panchang.abhijit ? (
              <>
                {" "}
                ·{" "}
                <span className="font-semibold text-emerald-700">
                  golden window:
                </span>{" "}
                {span(panchang.abhijit, tz)}
              </>
            ) : null}
          </p>
          <p className="sm:truncate">
            <span className="font-semibold text-violet-700">Godesi sees:</span>{" "}
            <span className="italic">{mood}</span> ·{" "}
            <span className="font-semibold">Lucky:</span> {luckyNumber} ·{" "}
            {luckyColour}
          </p>
        </div>
      </div>
      <div className="mt-2 flex gap-1.5 overflow-x-auto whitespace-nowrap font-semibold [scrollbar-width:none] sm:flex-wrap [&::-webkit-scrollbar]:hidden">
        {ASTRO_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="shrink-0 rounded-full border border-amber-300 bg-white px-2.5 py-1 text-slate-800 hover:bg-amber-50"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
