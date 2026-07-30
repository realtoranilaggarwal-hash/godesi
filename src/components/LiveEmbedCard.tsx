"use client";

import { useState } from "react";
import { Card } from "@/components/ui";
import { openLiveMedia } from "@/lib/liveMedia";
import { LiveReportButton } from "@/components/LiveReportButton";

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
  featured = false,
  about = null,
  websiteUrl = null,
  nonProfit = false,
  /** Member-submitted streams carry their embed to the floating player. */
  submitted = false,
}: {
  kind: "radio" | "tv";
  id: string;
  name: string;
  place: string;
  src: string;
  /** Radio embeds are a fixed 100px strip; TV keeps a 16:9 box. */
  height?: number;
  featured?: boolean;
  about?: string | null;
  websiteUrl?: string | null;
  nonProfit?: boolean;
  submitted?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Card
      className={`flex flex-col gap-3 ${
        featured ? "border-amber-400 bg-amber-50/60 ring-1 ring-amber-300" : ""
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-bold text-slate-900">
            {featured ? "⭐ " : ""}
            {name}
          </p>
          <p className="text-xs text-slate-500">{place}</p>
          {about ? <p className="mt-1 text-xs text-slate-600">{about}</p> : null}
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-semibold">
            {featured ? (
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-white">
                Featured
              </span>
            ) : null}
            {nonProfit ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800">
                Non-profit
              </span>
            ) : null}
            {websiteUrl ? (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noreferrer nofollow"
                className="text-indigo-600 hover:underline"
              >
                Website ↗
              </a>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            openLiveMedia(
              submitted ? { kind, id, name, src } : { kind, id },
            )
          }
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

      <div className="flex flex-wrap items-center justify-end gap-2">
        <LiveReportButton channelKey={id} kind={kind} label={name} />
      </div>
    </Card>
  );
}
