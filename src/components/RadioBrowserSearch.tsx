"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui";
import { openLiveMedia } from "@/lib/liveMedia";
import type { BrowsedStation } from "@/lib/radioBrowser";

const COUNTRIES = [
  { code: "", label: "Everywhere" },
  { code: "IN", label: "🇮🇳 India" },
  { code: "US", label: "🇺🇸 USA" },
  { code: "CA", label: "🇨🇦 Canada" },
  { code: "GB", label: "🇬🇧 UK" },
  { code: "AE", label: "🇦🇪 UAE" },
  { code: "AU", label: "🇦🇺 Australia" },
  { code: "PK", label: "🇵🇰 Pakistan" },
  { code: "NP", label: "🇳🇵 Nepal" },
  { code: "LK", label: "🇱🇰 Sri Lanka" },
];

/**
 * Thousands of free public stations, searched live and played inside Godesi's own
 * player so nobody has to leave the site.
 */
export function RadioBrowserSearch({ initial }: { initial: BrowsedStation[] }) {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("IN");
  const [stations, setStations] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!touched) return;
    let active = true;
    setLoading(true);
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (country) params.set("country", country);
      fetch(`/api/radio-stations?${params.toString()}`)
        .then((response) => (response.ok ? response.json() : null))
        .then((data: { stations?: BrowsedStation[] } | null) => {
          if (active) setStations(data?.stations ?? []);
        })
        .catch(() => undefined)
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 350);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query, country, touched]);

  return (
    <Card className="space-y-3">
      <div>
        <h2 className="text-lg font-black">🔎 Search thousands more stations</h2>
        <p className="text-xs text-slate-600">
          Free public stations from the open Radio Browser directory — they play
          right here in the Godesi player, so you never leave the site.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={query}
          onChange={(event) => {
            setTouched(true);
            setQuery(event.target.value);
          }}
          placeholder="Station, language or city — e.g. Punjabi, Tamil, Gujarati"
          className="min-w-0 flex-1 basis-48 rounded-xl border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          aria-label="Country"
          value={country}
          onChange={(event) => {
            setTouched(true);
            setCountry(event.target.value);
          }}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
        >
          {COUNTRIES.map((entry) => (
            <option key={entry.code} value={entry.code}>
              {entry.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Searching…</p>
      ) : stations.length ? (
        <ul className="grid gap-2 sm:grid-cols-2">
          {stations.map((station) => (
            <li
              key={station.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 p-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">
                  {station.name}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {station.place}
                  {station.tags ? ` · ${station.tags.split(",").slice(0, 3).join(", ")}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  openLiveMedia({
                    kind: "stream",
                    id: station.id,
                    name: station.name,
                    src: station.streamUrl,
                  })
                }
                className="shrink-0 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
              >
                ▶ Play
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">
          No stations matched. Try a language or city name.
        </p>
      )}

      <p className="text-[11px] text-slate-400">
        Station index by radio-browser.info (free, community maintained). Audio
        comes straight from each broadcaster; Godesi does not host or re-stream
        it.
      </p>
    </Card>
  );
}
