"use client";

import { useEffect, useState } from "react";
import { OfferCountdown } from "@/components/OfferCountdown";

/**
 * SUHAG JEWELERS LINK — their GoDesi listing (Iselin NJ); swap for an ad page URL if one is made.
 */
const SUHAG_JEWELLERS_URL = "/business/suhag-jewelers-iselin";

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
    title: "Suhag Jewelers",
    shortTitle: "Suhag Jewelers · Iselin NJ",
    line: "22Kt Gold & Diamond Center · Iselin NJ",
    colors: "border-red-800 bg-red-50 text-red-900 hover:bg-red-100",
  },
];

function live(creative: SkinCreative, now: number) {
  return (
    !creative.countdownTo || new Date(creative.countdownTo).getTime() > now
  );
}

/** Literal class sets so Tailwind ships them: "row" goes short below sm, "header" is always short. */
const LAYOUT = {
  row: {
    box: "h-9 gap-1.5 px-2 sm:gap-2 sm:px-3",
    short: "sm:hidden",
    long: "hidden sm:inline",
    timer: "text-[11px] sm:text-xs",
  },
  header: {
    box: "h-8 gap-1.5 px-2",
    short: "",
    long: "hidden",
    timer: "text-[11px]",
  },
} as const;

/** Picks one house creative per page view, in the browser. */
export function TopSkinHouse({
  variant = "row",
}: {
  variant?: keyof typeof LAYOUT;
}) {
  const layout = LAYOUT[variant];
  const [creative, setCreative] = useState<SkinCreative | null>(null);

  useEffect(() => {
    const now = Date.now();
    const options = SKIN_HOUSE.filter((item) => live(item, now));
    setCreative(options[Math.floor(Math.random() * options.length)] ?? null);
  }, []);

  if (!creative) {
    return (
      <div
        className={`${layout.box} w-full rounded-lg border-2 border-slate-200`}
      />
    );
  }

  return (
    <a
      href={creative.href}
      {...(creative.external
        ? { target: "_blank", rel: "noreferrer sponsored" }
        : {})}
      className={`flex w-full min-w-0 items-center justify-center rounded-lg border-2 text-sm font-semibold ${layout.box} ${creative.colors}`}
    >
      <span className="truncate">
        <span aria-hidden>{creative.emoji} </span>
        <span className={layout.short}>{creative.shortTitle}</span>
        <span className={layout.long}>{creative.title}</span>
        <span className={layout.long}> — {creative.line}</span>
      </span>
      {creative.countdownTo ? (
        <span className={`shrink-0 ${layout.timer}`}>
          <OfferCountdown endsAt={creative.countdownTo} />
        </span>
      ) : null}
      <span className={`shrink-0 ${layout.short}`}>
        {creative.countdownTo ? "Tickets →" : "→"}
      </span>
    </a>
  );
}
