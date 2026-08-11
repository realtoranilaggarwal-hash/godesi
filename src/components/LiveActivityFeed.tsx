"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ActivityItem } from "@/lib/activity";

const HIDE_KEY = "godesi-hide-live-feed";
const FIRST_DELAY = 6000;
const VISIBLE_MS = 7000;
const GAP_MS = 12000;

function ago(iso: string) {
  const minutes = Math.max(
    1,
    Math.round((Date.now() - Date.parse(iso)) / 60000),
  );
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.round(hours / 24)} d ago`;
}

/** Rotating "someone just did this" toasts, built from real recent activity. */
export function LiveActivityFeed({ items }: { items: ActivityItem[] }) {
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    setHidden(localStorage.getItem(HIDE_KEY) === "1");
  }, []);

  useEffect(() => {
    if (hidden || items.length === 0) return;
    let timer: ReturnType<typeof setTimeout>;

    const show = () => {
      setShown(true);
      timer = setTimeout(() => {
        setShown(false);
        setIndex((current) => (current + 1) % items.length);
        timer = setTimeout(show, GAP_MS);
      }, VISIBLE_MS);
    };

    timer = setTimeout(show, FIRST_DELAY);
    return () => clearTimeout(timer);
  }, [hidden, items.length, index]);

  if (hidden || items.length === 0) return null;
  const item = items[index];

  return (
    <div
      className={`fab-anchor pointer-events-none fixed bottom-4 left-4 z-40 max-w-[19rem] transition-all duration-300 ${
        shown
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
      aria-live="polite"
    >
      <div className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">
        <span className="text-xl" aria-hidden>
          {item.icon}
        </span>
        <div className="min-w-0 flex-1">
          <Link
            href={item.href}
            className="line-clamp-2 text-sm font-semibold text-slate-800 hover:text-indigo-600"
          >
            {item.text}
          </Link>
          <p className="mt-0.5 text-[11px] text-slate-400">
            {ago(item.at)} · Godesi
          </p>
        </div>
        <button
          type="button"
          aria-label="Hide activity feed"
          onClick={() => {
            localStorage.setItem(HIDE_KEY, "1");
            setHidden(true);
          }}
          className="text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
