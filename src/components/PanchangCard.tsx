import Link from "next/link";
import { type Panchang, type Period, panchangTime } from "@/lib/panchang";

function span(period: Period, timeZone: string) {
  return `${panchangTime(period.start, timeZone)} – ${panchangTime(period.end, timeZone)}`;
}

/** Today's tithi, nakshatra, Rahu Kaal and fasts for one place. */
export function PanchangCard({
  panchang,
  place,
  compact = false,
}: {
  panchang: Panchang;
  place: string;
  compact?: boolean;
}) {
  const tz = panchang.timeZone;
  const until = (value: Date | null) =>
    value ? ` till ${panchangTime(value, tz, true)}` : "";
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${panchang.date}T12:00:00Z`));

  return (
    <div
      className={`rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 text-sm text-slate-700 ${compact ? "flex items-center gap-3 px-3 py-2" : "p-4"}`}
    >
      {compact ? (
        <span
          aria-hidden
          className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-200 text-3xl"
        >
          🧘
          <span className="absolute -right-1 -top-1 text-lg">🪔</span>
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-bold text-slate-900">
            🪔 Today&apos;s Panchang · {place}
          </p>
          <p className="text-xs text-slate-500">
            {dateLabel} · {panchang.vaar}
          </p>
        </div>
        {panchang.observances.length ? (
          <p className="mt-2 rounded-lg bg-orange-100 px-2 py-1 font-semibold text-orange-800">
            🙏 Today: {panchang.observances.join(" · ")}
          </p>
        ) : null}
        <dl className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-2">
          <div>
            <dt className="inline font-semibold">Tithi: </dt>
            <dd className="inline">
              {panchang.tithi.paksha} {panchang.tithi.name}
              {until(panchang.tithi.endsAt)}
            </dd>
          </div>
          <div>
            <dt className="inline font-semibold">Nakshatra: </dt>
            <dd className="inline">
              {panchang.nakshatra.name}
              {until(panchang.nakshatra.endsAt)}
            </dd>
          </div>
          <div>
            <dt className="inline font-semibold">🌅 Sunrise / sunset: </dt>
            <dd className="inline">
              {panchangTime(panchang.sunrise, tz)} /{" "}
              {panchangTime(panchang.sunset, tz)}
            </dd>
          </div>
          <div>
            <dt className="inline font-semibold text-rose-700">
              ⛔ Rahu Kaal:{" "}
            </dt>
            <dd className="inline">{span(panchang.rahuKaal, tz)}</dd>
          </div>
          {compact ? null : (
            <>
              <div>
                <dt className="inline font-semibold">Yoga: </dt>
                <dd className="inline">{panchang.yoga}</dd>
              </div>
              <div>
                <dt className="inline font-semibold">Yamaganda: </dt>
                <dd className="inline">{span(panchang.yamaganda, tz)}</dd>
              </div>
              <div>
                <dt className="inline font-semibold">Gulika Kaal: </dt>
                <dd className="inline">{span(panchang.gulika, tz)}</dd>
              </div>
              {panchang.abhijit ? (
                <div>
                  <dt className="inline font-semibold text-emerald-700">
                    ✨ Abhijit muhurat:{" "}
                  </dt>
                  <dd className="inline">{span(panchang.abhijit, tz)}</dd>
                </div>
              ) : null}
            </>
          )}
        </dl>
        {compact ? (
          <Link
            href="/astrology/panchang"
            className="mt-2 inline-block text-xs font-semibold text-orange-700 hover:underline"
          >
            Full panchang, other cities and the morning email →
          </Link>
        ) : (
          <p className="mt-2 text-xs text-slate-500">
            Worked out for sunrise at this place (Lahiri ayanamsa). Fast and
            festival dates can differ by a day between traditions, so check with
            your temple or pandit.
          </p>
        )}
      </div>
    </div>
  );
}
