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
        onClick={() => openLiveMedia({ kind: "radio", id: RADIO_STATIONS[0].id })}
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
    </div>
  );
}

/** "🎧 Live Radio | 📺 Live TV" pair used in the header bar and the footer. */
export function LiveMediaLinks({
  className = "",
  buttonClass = "",
}: {
  className?: string;
  buttonClass?: string;
}) {
  const base =
    buttonClass ||
    "rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold text-white hover:bg-white/25";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => openLiveMedia({ kind: "radio", id: RADIO_STATIONS[0].id })}
        className={base}
      >
        🎧 Live Radio
      </button>
      <button
        type="button"
        onClick={() => openLiveMedia({ kind: "tv", id: TV_CHANNELS[0].id })}
        className={base}
      >
        📺 Live TV
      </button>
      <Link
        href="/live-radio"
        className="text-xs font-semibold text-white/80 underline hover:text-white"
      >
        all stations
      </Link>
      <Link
        href="/live/submit"
        className="text-xs font-semibold text-white/80 underline hover:text-white"
      >
        add yours
      </Link>
    </div>
  );
}
