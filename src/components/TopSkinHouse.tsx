"use client";

import { useEffect, useState } from "react";
import { OfferCountdown } from "@/components/OfferCountdown";

/**
 * SUHAG JEWELLERS LINK — swap for a GoDesi Suhag ad page URL once one exists.
 */
const SUHAG_JEWELLERS_URL = "https://suhagjewellers.com";

/** New Year's Eve 2026 midnight, New York time. */
const NYE_MIDNIGHT = "2027-01-01T00:00:00-05:00";

/** GoDesi's own top-strip creatives, rotated while the SKIN slot is unsold. */
type SkinCreative = {
  slug: string;
  href: string;
  emoji: string;
  title: string;
  /** Shorter title for phones. */
  shortTitle: string;
  line: string;
  /** Tailwind border/background/text classes; kept as literals so Tailwind ships them. */
  colors: string;
  countdownTo?: string;
  external?: boolean;
};

const SKIN_HOUSE: SkinCreative[] = [
  {
    slug: "nye",
    href: "/nye2027",
    emoji: "🎆",
    title: "New Year's Eve Party 2027",
    shortTitle: "NYE 2027",
    line: "Buy Tickets",
    colors: "border-amber-400 bg-amber-50 text-amber-900 hover:bg-amber-100",
    countdownTo: NYE_MIDNIGHT,
  },
  {
    slug: "suhag",
    href: SUHAG_JEWELLERS_URL,
    emoji: "💎",
    title: "Suhag Jewellers",
    shortTitle: "Suhag Jewellers",
    line: "fine desi jewelry",
    colors: "border-red-800 bg-red-50 text-red-900 hover:bg-red-100",
    external: true,
  },
];

function live(creative: SkinCreative, now: number) {
  return !creative.countdownTo || new Date(creative.countdownTo).getTime() > now;
}

/** Picks one house creative per page view, in the browser. */
export function TopSkinHouse() {
  const [creative, setCreative] = useState<SkinCreative | null>(null);

  useEffect(() => {
    const now = Date.now();
    const options = SKIN_HOUSE.filter((item) => live(item, now));
    setCreative(options[Math.floor(Math.random() * options.length)] ?? null);
  }, []);

  if (!creative) {
    return <div className="h-9 w-full rounded-lg border-2 border-slate-200" />;
  }

  return (
    <a
      href={creative.href}
      {...(creative.external
        ? { target: "_blank", rel: "noreferrer sponsored" }
        : {})}
      className={`flex h-9 w-full min-w-0 items-center justify-center gap-1.5 rounded-lg border-2 px-2 sm:gap-2 sm:px-3 text-sm font-semibold ${creative.colors}`}
    >
      <span className="truncate">
        <span aria-hidden>{creative.emoji} </span>
        <span className="sm:hidden">{creative.shortTitle}</span>
        <span className="hidden sm:inline">{creative.title}</span>
        <span className="hidden sm:inline"> — {creative.line}</span>
      </span>
      {creative.countdownTo ? (
        <span className="shrink-0 text-[11px] sm:text-xs">
          <OfferCountdown endsAt={creative.countdownTo} />
        </span>
      ) : null}
      <span className="shrink-0 sm:hidden">{creative.countdownTo ? "Tickets →" : "→"}</span>
    </a>
  );
}
