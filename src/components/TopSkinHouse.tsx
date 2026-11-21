"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NYE_COUNTDOWN_TO_MS } from "@/lib/topSkin";

export type HouseSkin = "nye" | "suhag";

/** Where `/nye2027` redirects (next.config.mjs): the GoDesi event's ticket box. */
const NYE_TICKETS_URL = "/events/new-year-eves-party-2027-edison#tickets";

/**
 * Suhag Jewelers' GoDesi business page (22Kt gold & diamonds, Iselin NJ).
 * Swap for an outside URL (e.g. https://suhagjewelers.com) to send clicks
 * straight to their site.
 */
const SUHAG_URL = "/business/suhag-jewelers-iselin";
const SUHAG_LOGO =
  "https://wui097wknpuic6dl.public.blob.vercel-storage.com/listings/cms24edsq0000t9gk48f24h5h/1793127558510-52uSBUEiDm8X82FQ11ADANaiT2NH2l.jpg";

const strip =
  "flex h-14 w-full min-w-0 items-center gap-2 overflow-hidden rounded-xl px-3 text-white shadow-sm transition hover:shadow-md sm:h-[72px] sm:gap-4 sm:px-5";
const cta =
  "shrink-0 whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-xs font-bold shadow sm:px-4 sm:py-2 sm:text-sm";

/** House creatives for the top strip while no advertiser has booked it. */
export function TopSkinHouse({ pick }: { pick: HouseSkin }) {
  return pick === "nye" ? <NyeSkin /> : <SuhagSkin />;
}

function NyeSkin() {
  return (
    <Link
      href={NYE_TICKETS_URL}
      className={`${strip} bg-gradient-to-r from-indigo-700 via-fuchsia-600 to-amber-500`}
    >
      <span aria-hidden className="hidden text-3xl sm:block">
        🎆
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block truncate text-sm font-extrabold sm:text-lg">
          <span className="sm:hidden">NYE Party</span>
          <span className="hidden sm:inline">Grand New Year&apos;s Eve Party</span>
        </span>
        <span className="block truncate text-[11px] text-white/85 sm:hidden">
          Fords NJ · Dec 31
        </span>
        <span className="hidden truncate text-xs text-white/85 sm:block">
          Royal Albert Palace, Fords NJ · Dec 31, 8 PM
        </span>
      </span>
      <Countdown to={NYE_COUNTDOWN_TO_MS} />
      <span className={`${cta} text-fuchsia-700`}>
        Buy Tickets
      </span>
    </Link>
  );
}

function SuhagSkin() {
  return (
    <Link
      href={SUHAG_URL}
      className={`${strip} bg-gradient-to-r from-red-800 via-red-600 to-amber-600`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={SUHAG_LOGO}
        alt=""
        width={48}
        height={48}
        className="h-10 w-10 shrink-0 rounded-lg object-cover sm:h-12 sm:w-12"
      />
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block truncate text-sm font-extrabold sm:text-lg">
          Suhag Jewelers
        </span>
        <span className="block truncate text-[11px] text-amber-100 sm:text-xs">
          22Kt Gold &amp; Diamond Center · Iselin, NJ
        </span>
      </span>
      <span className={`${cta} text-red-700`}>
        Visit Store
      </span>
    </Link>
  );
}

const UNITS = [
  ["d", 86_400],
  ["h", 3_600],
  ["m", 60],
  ["s", 1],
] as const;

/** Live days/hrs/min/sec; blank on the server so hydration matches. */
function Countdown({ to }: { to: number }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  let left = now === null ? null : Math.max(0, Math.floor((to - now) / 1000));

  return (
    <span
      className="flex shrink-0 gap-1 font-mono tabular-nums sm:gap-1.5"
      aria-label="Time until midnight"
    >
      {UNITS.map(([unit, size]) => {
        const value = left === null ? null : Math.floor(left / size);
        if (left !== null && value !== null) left -= value * size;
        return (
          <span
            key={unit}
            className={`rounded-md bg-black/25 px-1 py-0.5 text-center text-[11px] font-bold sm:min-w-[44px] sm:px-1.5 sm:py-1 sm:text-base ${unit === "s" ? "hidden sm:inline-block" : ""}`}
          >
            {value === null ? "--" : String(value).padStart(2, "0")}
            <span className="text-[9px] font-semibold text-white/80 sm:text-[11px]">
              {unit}
            </span>
          </span>
        );
      })}
    </span>
  );
}
