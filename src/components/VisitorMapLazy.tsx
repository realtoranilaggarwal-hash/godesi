"use client";

import dynamic from "next/dynamic";

/** Leaflet touches `window` as soon as it loads, so the map only renders in the browser. */
export const VisitorMapLazy = dynamic(
  () => import("@/components/VisitorMap").then((m) => m.VisitorMap),
  {
    ssr: false,
    loading: () => <div className="h-[360px] rounded-xl bg-slate-100" />,
  },
);
