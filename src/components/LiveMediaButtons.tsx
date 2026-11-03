"use client";

import Link from "next/link";
import {
  RADIO_STATIONS,
  TV_CHANNELS,
  openLiveMedia,
  type LiveMediaRequest,
} from "@/lib/liveMedia";

/** Opens the floating player straight away, no page load needed. */
export function PlayLiveButton({
  kind,
  id,
  className = "",
  children,
}: {
  kind: LiveMediaRequest["kind"];
  id: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => openLiveMedia({ kind, id })}
      className={className}
    >
      {children}
    </button>
  );
}

/** Chips beside the search box: one tap starts the floating player. */
export function LiveMediaChips({ className = "" }: { className?: string }) {
  const chip =
    "rounded-full px-2.5 py-1.5 text-xs font-bold text-white shadow-sm hover:brightness-110";

  return (
    <div className={`flex shrink-0 items-center gap-1 ${className}`}>
      <button
        type="button"
        onClick={() =>
          openLiveMedia({ kind: "radio", id: RADIO_STATIONS[0].id })
        }
        title="Play live desi radio"
        className={`${chip} bg-gradient-to-r from-emerald-500 to-teal-600`}
      >
        🎧 Radio
      </button>
      <button
        type="button"
        onClick={() => openLiveMedia({ kind: "tv", id: TV_CHANNELS[0].id })}
        title="Watch live desi TV"
        className={`${chip} bg-gradient-to-r from-rose-500 to-orange-500`}
      >
        📺 TV
      </button>
      <Link
        href="/news"
        title="Desi news and local reports"
        className={`${chip} bg-gradient-to-r from-sky-500 to-indigo-600`}
      >
        📰 News
      </Link>
    </div>
  );
}

/** "🎧 Live Radio | 📺 Live TV | 🔗 Links" row used in the header bar and the footer. */
export function LiveMediaLinks({
  className = "",
  buttonClass = "",
  compact = false,
}: {
  className?: string;
  buttonClass?: string;
  /** Header use: one-word labels and no Links chip on phones, to leave room for Register/Log in. */
  compact?: boolean;
}) {
  const base =
    buttonClass ||
    "whitespace-nowrap rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold text-white hover:bg-white/25";
  const live = compact ? <span className="max-sm:hidden">Live </span> : "Live ";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() =>
          openLiveMedia({ kind: "radio", id: RADIO_STATIONS[0].id })
        }
        className={base}
      >
        🎧 {live}Radio
      </button>
      <button
        type="button"
        onClick={() => openLiveMedia({ kind: "tv", id: TV_CHANNELS[0].id })}
        className={base}
      >
        📺 {live}TV
      </button>
      <Link
        href="/resources"
        className={`${base} ${compact ? "max-sm:hidden" : ""}`}
      >
        🔗 Links
      </Link>
      <Link
        href="/resources/new"
        className="hidden sm:block text-xs font-semibold text-white/80 underline hover:text-white"
      >
        add links
      </Link>
      <Link
        href="/live-radio"
        className="hidden sm:block text-xs font-semibold text-white/80 underline hover:text-white"
      >
        all stations
      </Link>
      <Link
        href="/news/report"
        className="hidden md:block text-xs font-semibold text-white/80 underline hover:text-white"
      >
        add your news
      </Link>
      <Link
        href="/leads"
        className="hidden md:block text-xs font-semibold text-white/80 underline hover:text-white"
      >
        help clients
      </Link>
    </div>
  );
}
