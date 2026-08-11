"use client";

import { useEffect, useState } from "react";
import type { LiveSnapshot } from "@/lib/live";

/** Web-Mercator position of a coordinate inside the 0–1 tile square. */
function project(lat: number, lng: number) {
  const x = (lng + 180) / 360;
  const clamped = Math.max(-85, Math.min(85, lat));
  const radians = (clamped * Math.PI) / 180;
  const y =
    0.5 -
    Math.log((1 + Math.sin(radians)) / (1 - Math.sin(radians))) / (4 * Math.PI);
  return { x: x * 100, y: y * 100 };
}

const TILES = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
];

/**
 * Live visitor map. Base map is OpenStreetMap zoom-1 tiles (ODbL, attributed
 * below); dots are anonymous city-level pings from the last half hour.
 */
export function LiveVisitorMap({ compact = false }: { compact?: boolean }) {
  const [data, setData] = useState<LiveSnapshot | null>(null);

  useEffect(() => {
    let active = true;
    const load = () =>
      fetch("/api/live")
        .then((response) => (response.ok ? response.json() : null))
        .then((snapshot: LiveSnapshot | null) => {
          if (active && snapshot) setData(snapshot);
        })
        .catch(() => undefined);

    void load();
    const timer = setInterval(load, 20_000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
        <p className="text-sm font-bold text-slate-900">
          <span className="mr-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500 align-middle" />
          Live on Godesi
        </p>
        <p className="text-xs font-semibold text-slate-500">
          {data ? `${data.online} in 30 min` : "…"}
        </p>
      </div>

      {/* Zoom-1 tiles are a square world; crop the empty polar bands. */}
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-slate-100">
        <div className="absolute inset-x-0 top-[-16.7%] aspect-square w-full">
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
            {TILES.map((tile) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${tile.x}-${tile.y}`}
                src={`https://tile.openstreetmap.org/1/${tile.x}/${tile.y}.png`}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover opacity-90"
              />
            ))}
          </div>

          {(data?.dots ?? []).map((dot) => {
            const point = project(dot.lat, dot.lng);
            const size = Math.min(18, 8 + dot.weight * 2);
            return (
              <span
                key={`${dot.lat},${dot.lng}`}
                title={`${dot.city} — ${dot.weight} viewing`}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500/70 ring-2 ring-white"
                style={{
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                  width: size,
                  height: size,
                }}
              >
                <span className="absolute inset-0 animate-ping rounded-full bg-rose-400/60" />
              </span>
            );
          })}
        </div>
      </div>

      <div className="space-y-2 px-3 py-2">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-600">
          <span>👥 {data?.online ?? 0} visitors</span>
          <span>🏙️ {data?.cities ?? 0} cities</span>
          <span>🌍 {data?.countries ?? 0} countries</span>
        </div>

        {data?.topCities.length ? (
          <div className="flex flex-wrap gap-1.5">
            {data.topCities.map((city) => (
              <span
                key={city.label}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700"
              >
                {city.label} · {city.count}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            Waiting for the next visitor…
          </p>
        )}

        {compact ? null : (
          <ul className="max-h-64 space-y-1 overflow-y-auto text-xs text-slate-600">
            {(data?.recent ?? []).map((visit) => (
              <li key={visit.id} className="truncate">
                <span className="font-semibold text-slate-800">
                  {visit.city}
                </span>{" "}
                viewed{" "}
                <span className="font-mono text-[11px]">{visit.path}</span> ·{" "}
                {visit.minutesAgo === 0 ? "now" : `${visit.minutesAgo}m ago`}
              </li>
            ))}
          </ul>
        )}

        <p className="text-[10px] text-slate-400">
          City-level only, no personal data. Map ©{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            className="underline"
            rel="noreferrer noopener"
            target="_blank"
          >
            OpenStreetMap
          </a>{" "}
          contributors.
        </p>
      </div>
    </section>
  );
}
