"use client";

import { useState } from "react";
import { Card } from "@/components/ui";
import { openLiveMedia } from "@/lib/liveMedia";

/**
 * Nothing is fetched from TuneIn or YouTube until the visitor presses play,
 * which keeps the page light on mobile data.
 */
export function LiveEmbedCard({
  kind,
  id,
  name,
  place,
  src,
  height,
}: {
  kind: "radio" | "tv";
  id: string;
  name: string;
  place: string;
  src: string;
  /** Radio embeds are a fixed 100px strip; TV keeps a 16:9 box. */
  height?: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-bold text-slate-900">{name}</p>
          <p className="text-xs text-slate-500">{place}</p>
        </div>
        <button
          type="button"
          onClick={() => openLiveMedia({ kind, id })}
          className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          Keep playing while I browse
        </button>
      </div>

      {open ? (
        <iframe
          title={`${name} live`}
          src={src}
          loading="lazy"
          scrolling="no"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          style={height ? { height } : undefined}
          className={`w-full border-0 ${height ? "" : "aspect-video"}`}
        />
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`flex w-full items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700 hover:bg-slate-200 ${
            height ? "" : "aspect-video"
          }`}
          style={height ? { height } : undefined}
        >
          ▶ Play {kind === "radio" ? "station" : "channel"}
        </button>
      )}
    </Card>
  );
}
