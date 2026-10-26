"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { COUNTRY_CENTROIDS } from "@/lib/countryCentroids";

export type MapCountry = { name: string; active: number; visitors: number };

/**
 * Interactive OpenStreetMap + Leaflet visitor map: an amber dot per country
 * sized by the last 30 days of visitors, and a pulsing green dot where people
 * are on the site right now. Free tiles, no API key.
 */
export function VisitorMap({ countries }: { countries: MapCountry[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const map = L.map(ref.current, {
      scrollWheelZoom: false,
      worldCopyJump: true,
    }).setView([25, 10], 2);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 12,
    }).addTo(map);

    const layer = L.layerGroup().addTo(map);
    const max = Math.max(1, ...countries.map((c) => c.visitors));
    for (const c of countries) {
      const at = COUNTRY_CENTROIDS[c.name];
      if (!at) continue;
      // sqrt scaling keeps small countries visible without letting the
      // biggest one swallow the map.
      const radius = 5 + Math.sqrt(c.visitors / max) * 22;
      L.circleMarker(at, {
        radius,
        color: "#b45309",
        weight: 1.5,
        fillColor: "#f59e0b",
        fillOpacity: 0.45,
      })
        .bindTooltip(
          `<b>${c.name}</b><br/>${c.visitors.toLocaleString()} visitors (30 days)` +
            (c.active > 0
              ? `<br/>🟢 ${c.active.toLocaleString()} on now`
              : ""),
        )
        .addTo(layer);
      if (c.active > 0) {
        L.circleMarker(at, {
          radius: 4 + Math.min(c.active, 8),
          color: "#047857",
          weight: 1.5,
          fillColor: "#10b981",
          fillOpacity: 0.9,
          className: "animate-pulse",
        }).addTo(layer);
      }
    }

    return () => {
      map.remove();
    };
  }, [countries]);

  return (
    <div
      ref={ref}
      className="z-0 h-[360px] w-full rounded-xl border border-slate-200"
    />
  );
}
