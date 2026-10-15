"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button, Card, Field, inputClass } from "@/components/ui";
import type { Kundli } from "@/lib/kundli";
import { NAKSHATRAS, RASHIS } from "@/lib/kundliSigns";

type Result = {
  place: string;
  timeZone: string;
  utc: string;
  kundli: Kundli;
  attribution: string;
};

/** Centre of each house in the North Indian diamond chart (400×400 box). */
const HOUSE_CENTRES: [number, number][] = [
  [200, 100],
  [100, 45],
  [45, 100],
  [100, 200],
  [45, 300],
  [100, 355],
  [200, 300],
  [300, 355],
  [355, 300],
  [300, 200],
  [355, 100],
  [300, 45],
];

const rashiLabel = (sign: number) =>
  `${RASHIS[sign].name} (${RASHIS[sign].english})`;

const dms = (degree: number) => {
  const whole = Math.floor(degree);
  const minutes = Math.floor((degree - whole) * 60);
  return `${whole}° ${String(minutes).padStart(2, "0")}′`;
};

function NorthIndianChart({ kundli }: { kundli: Kundli }) {
  const lagna = kundli.lagna?.sign ?? kundli.moonSign;
  return (
    <svg
      viewBox="0 0 400 400"
      role="img"
      aria-label="North Indian kundli chart"
      className="mx-auto w-full max-w-sm"
    >
      <rect
        x="2"
        y="2"
        width="396"
        height="396"
        fill="#fffbeb"
        stroke="#b45309"
        strokeWidth="3"
      />
      <g stroke="#b45309" strokeWidth="2" fill="none">
        <line x1="2" y1="2" x2="398" y2="398" />
        <line x1="398" y1="2" x2="2" y2="398" />
        <polygon points="200,2 398,200 200,398 2,200" />
      </g>
      {HOUSE_CENTRES.map(([x, y], index) => {
        const house = index + 1;
        const sign = (lagna + index) % 12;
        const grahas = kundli.planets
          .filter((planet) => planet.sign === sign)
          .map(
            (planet) =>
              `${planet.short}${planet.retrograde && planet.key !== "Rahu" && planet.key !== "Ketu" ? "ᴿ" : ""}`,
          );
        if (house === 1 && kundli.lagna) grahas.unshift("As");
        const big = [1, 4, 7, 10].includes(house);
        return (
          <g key={house} textAnchor="middle" fontFamily="sans-serif">
            <text
              x={x}
              y={y - (big ? 28 : 16)}
              fontSize="13"
              fill="#b45309"
              fontWeight="700"
            >
              {sign + 1}
            </text>
            {grahas.length ? (
              <text x={x} y={y + 4} fontSize={big ? 15 : 12} fill="#1e1b4b">
                {grahas.slice(0, big ? 4 : 3).join(" ")}
              </text>
            ) : null}
            {grahas.length > (big ? 4 : 3) ? (
              <text x={x} y={y + 20} fontSize={big ? 15 : 12} fill="#1e1b4b">
                {grahas.slice(big ? 4 : 3).join(" ")}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

export function KundliCalculator() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [place, setPlace] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/kundli", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          time: timeUnknown || !time ? undefined : time,
          place,
        }),
      });
      const data = (await res.json()) as Result & { error?: string };
      if (!res.ok) {
        setResult(null);
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  const kundli = result?.kundli;

  return (
    <div className="space-y-5">
      <Card>
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <Field label="Date of birth" required>
            <input
              type="date"
              required
              min="1800-01-01"
              max="2100-12-31"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Time of birth" required={!timeUnknown}>
            <input
              type="time"
              required={!timeUnknown}
              disabled={timeUnknown}
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className={inputClass}
            />
          </Field>
          <Field
            label="Place of birth"
            required
            hint="City with state or country, e.g. Jaipur, India"
            className="sm:col-span-2"
          >
            <input
              type="text"
              required
              minLength={2}
              maxLength={120}
              value={place}
              onChange={(event) => setPlace(event.target.value)}
              placeholder="Jaipur, India"
              className={inputClass}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
            <input
              type="checkbox"
              checked={timeUnknown}
              onChange={(event) => setTimeUnknown(event.target.checked)}
            />
            I don&apos;t know my birth time
          </label>
          <div className="sm:col-span-2">
            <Button
              type="submit"
              disabled={pending}
              className="w-full sm:w-auto"
            >
              {pending ? "Working out your chart…" : "🔮 Make my kundli"}
            </Button>
            <p className="mt-2 text-xs text-slate-500">
              Free. Your birth details are used only for this chart and are not
              saved.
            </p>
          </div>
          {error ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2">
              {error}
            </p>
          ) : null}
        </form>
      </Card>

      {kundli && result ? (
        <>
          <Card>
            <h2 className="text-lg font-bold">Your kundli at a glance</h2>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-xl bg-violet-50 p-3">
                <dt className="text-xs font-semibold uppercase text-violet-700">
                  Rashi (Moon sign)
                </dt>
                <dd className="mt-1 text-base font-bold">
                  {rashiLabel(kundli.moonSign)}
                </dd>
              </div>
              <div className="rounded-xl bg-violet-50 p-3">
                <dt className="text-xs font-semibold uppercase text-violet-700">
                  Nakshatra
                </dt>
                <dd className="mt-1 text-base font-bold">
                  {NAKSHATRAS[kundli.nakshatra.index]}, pada{" "}
                  {kundli.nakshatra.pada}
                </dd>
              </div>
              <div className="rounded-xl bg-violet-50 p-3">
                <dt className="text-xs font-semibold uppercase text-violet-700">
                  Lagna (Rising sign)
                </dt>
                <dd className="mt-1 text-base font-bold">
                  {kundli.lagna
                    ? `${rashiLabel(kundli.lagna.sign)} ${dms(kundli.lagna.degree)}`
                    : "Needs your birth time"}
                </dd>
              </div>
              <div className="rounded-xl bg-violet-50 p-3">
                <dt className="text-xs font-semibold uppercase text-violet-700">
                  Sun sign (Vedic)
                </dt>
                <dd className="mt-1 text-base font-bold">
                  {rashiLabel(kundli.sunSign)}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-slate-500">
              Place used: {result.place} ({result.timeZone}).{" "}
              {result.attribution}.
            </p>
            {!kundli.lagna ? (
              <p className="mt-2 text-xs text-amber-700">
                Without a birth time the chart below starts from your Moon sign,
                and the Moon may have been in the next nakshatra later that day.
              </p>
            ) : null}
          </Card>

          <Card>
            <h2 className="text-lg font-bold">
              {kundli.lagna ? "Lagna chart" : "Moon chart (Chandra kundli)"}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              North Indian style. The top diamond is house 1; the numbers are
              rashis (1 = Mesha … 12 = Meena).
            </p>
            <div className="mt-3">
              <NorthIndianChart kundli={kundli} />
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-bold">Planet positions</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-1 pr-3">Graha</th>
                    <th className="py-1 pr-3">Rashi</th>
                    <th className="py-1 pr-3">Degree</th>
                    <th className="py-1">House</th>
                  </tr>
                </thead>
                <tbody>
                  {kundli.planets.map((planet) => (
                    <tr key={planet.key} className="border-t border-slate-100">
                      <td className="py-1.5 pr-3 font-medium">
                        {planet.name}
                        {planet.retrograde &&
                        planet.key !== "Rahu" &&
                        planet.key !== "Ketu"
                          ? " (R)"
                          : ""}
                      </td>
                      <td className="py-1.5 pr-3">{rashiLabel(planet.sign)}</td>
                      <td className="py-1.5 pr-3">{dms(planet.degree)}</td>
                      <td className="py-1.5">{planet.house ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Sidereal zodiac, Lahiri ayanamsa ({dms(kundli.ayanamsa)}),
              whole-sign houses, mean Rahu/Ketu. (R) = retrograde.
            </p>
          </Card>

          <Card className="bg-violet-50">
            <h2 className="text-lg font-bold">Want it read properly?</h2>
            <p className="mt-1 text-sm text-slate-700">
              A chart is only the starting point. An astrologer or pandit can
              read it for marriage matching, muhurat or a naming ceremony.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm font-bold">
              <Link
                href="/categories/religious-services-astrologers"
                className="rounded-xl bg-violet-700 px-3 py-2 text-white"
              >
                Find an astrologer on GoDesi
              </Link>
              <Link
                href="/astrology/kundli-matching-for-marriage"
                className="rounded-xl border border-violet-300 px-3 py-2 text-violet-700"
              >
                How kundli matching works
              </Link>
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}
