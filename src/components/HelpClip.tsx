"use client";

import { useEffect, useState } from "react";
import type { HelpClipCard } from "@/lib/helpClips";

const SEEN_KEY = "godesi.helpClip.seen";

/**
 * A short "how it works" clip in the sidebar. Nothing loads from YouTube until
 * the visitor presses play, and the card only opens itself on a first visit —
 * after that it stays a one-line link.
 */
export function HelpClip({
  clip,
  embedUrl,
}: {
  clip: HelpClipCard;
  embedUrl: string;
}) {
  const [seen, setSeen] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(SEEN_KEY) ?? "";
      setSeen(stored.split(",").includes(clip.id));
    } catch {
      setSeen(false);
    }
  }, [clip.id]);

  function remember() {
    try {
      const stored = window.localStorage.getItem(SEEN_KEY) ?? "";
      const ids = stored.split(",").filter(Boolean);
      if (!ids.includes(clip.id)) ids.push(clip.id);
      window.localStorage.setItem(SEEN_KEY, ids.slice(-40).join(","));
    } catch {
      /* private browsing — the card simply shows again next time */
    }
    setSeen(true);
  }

  function play() {
    setPlaying(true);
    remember();
    void fetch(`/api/help-clip/${clip.id}/play`, { method: "POST" }).catch(
      () => undefined,
    );
  }

  if (hidden) return null;

  if (playing) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black">
        <div className="relative aspect-[9/16]">
          <iframe
            src={`${embedUrl}?autoplay=1&rel=0`}
            title={clip.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
        <button
          type="button"
          onClick={() => setPlaying(false)}
          className="w-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
        >
          Close video
        </button>
      </div>
    );
  }

  if (seen) {
    return (
      <button
        type="button"
        onClick={play}
        className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-slate-50"
      >
        <span aria-hidden>▶</span> {clip.title}
      </button>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-indigo-200 bg-indigo-50">
      <button
        type="button"
        onClick={play}
        className="block w-full text-left"
        aria-label={`Play: ${clip.title}`}
      >
        <span className="relative block aspect-video bg-slate-900">
          {clip.thumbnailUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={clip.thumbnailUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-80"
            />
          ) : null}
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-white/90 text-lg text-indigo-700 shadow">
              ▶
            </span>
          </span>
        </span>
        <span className="block px-3 py-2">
          <span className="block text-sm font-bold text-indigo-900">
            {clip.title}
          </span>
          {clip.note ? (
            <span className="block text-xs text-indigo-700">{clip.note}</span>
          ) : null}
        </span>
      </button>
      <button
        type="button"
        onClick={() => {
          remember();
          setHidden(true);
        }}
        className="w-full border-t border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
      >
        No thanks
      </button>
    </div>
  );
}
