"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BannerImpression } from "@/components/BannerImpression";

export type SmallBanner = { id: string; title: string; imageUrl: string };

/** Sections where the page needs the full width and ads would be in the way. */
const HIDDEN_ON = [
  "/admin",
  "/dashboard",
  "/login",
  "/signup",
  "/forgot-password",
];

/**
 * A stack of 320x100 banners. The root layout stays mounted between pages, so
 * the next set of banners rotates in on every page change.
 */
export function SmallBannerRail({
  banners,
  show,
  embedded = false,
}: {
  banners: SmallBanner[];
  show: number;
  /** Inside a page's own right column rather than the site-wide rail. */
  embedded?: boolean;
}) {
  const pathname = usePathname();
  const [offset, setOffset] = useState(0);
  const firstPath = useRef(pathname);

  useEffect(() => {
    if (pathname === firstPath.current) return;
    firstPath.current = pathname;
    setOffset((value) => value + show);
  }, [pathname, show]);

  if (!embedded && HIDDEN_ON.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  const visible = Array.from(
    { length: Math.min(show, banners.length) },
    (_, index) => banners[(offset + index) % banners.length],
  );

  const stack = (
    <div className="space-y-3" aria-label="Sponsored">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Sponsored
      </p>
      {visible.map((banner) => (
        <a
          key={banner.id}
          href={`/api/banners/${banner.id}/click`}
          target="_blank"
          rel="noreferrer sponsored"
          title={banner.title}
          className="block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
        >
          <BannerImpression id={banner.id} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={banner.imageUrl}
            alt={banner.title}
            width={320}
            height={100}
            loading="lazy"
            className="h-auto w-full object-cover"
          />
        </a>
      ))}
      <Link
        href="/advertise?slot=MOBILE#book"
        className="flex aspect-[16/5] w-full items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white px-3 text-center text-xs font-semibold text-slate-500 hover:border-indigo-400 hover:text-indigo-600"
      >
        Your 320 × 100 banner here — book this spot
      </Link>
    </div>
  );

  if (embedded) return stack;

  return (
    <aside data-site-rail className="hidden w-[320px] shrink-0 xl:block">
      {stack}
    </aside>
  );
}
