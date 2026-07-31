"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LIVE_MEDIA_EVENT } from "@/lib/liveMedia";

const KEY = "godesi-live-nudge";
const STATIONS_BEFORE_ASKING = 3;
const MINUTES_BEFORE_ASKING = 5;

/**
 * Radio and TV stay free — no wall. After a few stations, or a few minutes of
 * listening, signed-out visitors are offered an account to keep favourites.
 */
export function LiveSignupNudge({ kind }: { kind: "radio" | "tv" }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem(KEY)) return;

    let plays = 0;
    const show = () => setVisible(true);

    function onOpen() {
      plays += 1;
      if (plays >= STATIONS_BEFORE_ASKING) show();
    }

    window.addEventListener(LIVE_MEDIA_EVENT, onOpen);
    const timer = window.setTimeout(show, MINUTES_BEFORE_ASKING * 60_000);
    return () => {
      window.removeEventListener(LIVE_MEDIA_EVENT, onOpen);
      window.clearTimeout(timer);
    };
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    window.localStorage.setItem(KEY, "1");
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-3 bottom-3 z-30 sm:inset-x-auto sm:left-4 sm:max-w-sm">
      <div className="flex items-start gap-3 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-fuchsia-50 px-4 py-3 shadow-lg">
        <span aria-hidden className="text-xl">
          {kind === "tv" ? "📺" : "🎧"}
        </span>
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-semibold text-slate-800">
            Enjoying it? Keep listening free — sign up to save your favourite{" "}
            {kind === "tv" ? "channels" : "stations"} and earn reward points.
          </p>
          <Link
            href={`/signup?next=${kind === "tv" ? "/live-tv" : "/live-radio"}`}
            onClick={dismiss}
            className="mt-1 inline-block font-bold text-indigo-700 underline"
          >
            Create a free account →
          </Link>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
