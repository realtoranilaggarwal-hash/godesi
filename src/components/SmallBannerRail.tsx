"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BannerImpression } from "@/components/BannerImpression";
import { HOUSE_BANNERS } from "@/components/houseBanners";

export type SmallBanner = { id: string; title: string; imageUrl: string };

/** Rail width plus the gap beside it. */
const RAIL_SPACE = 320 + 24;

/** Fired when a site-wide rail shows or hides, so the strip can re-check. */
const RAIL_CHANGED = "godesi:small-banner-rail";

/**
 * Width the page's content really uses. A plain block that only wraps other
 * blocks (e.g. a centred `max-w-3xl` column) is as wide as its widest child,
 * and a row of columns where one grows is as wide as its columns added up.
 */
function usedWidth(element: Element, depth = 0): number {
  const width = element.getBoundingClientRect().width;
  const style = getComputedStyle(element);
  const children = Array.from(element.children).filter((child) => {
    const childStyle = getComputedStyle(child);
    return (
      childStyle.display !== "none" &&
      childStyle.position !== "absolute" &&
      childStyle.position !== "fixed"
    );
  });
  if (depth > 5 || children.length === 0) return width;

  if (style.display === "flex") {
    const columns =
      style.flexDirection === "row" &&
      style.flexWrap === "nowrap" &&
      !style.justifyContent.startsWith("space-") &&
      children.some(
        (child) => parseFloat(getComputedStyle(child).flexGrow) > 0,
      );
    if (!columns) return width;
    const gap = parseFloat(style.columnGap) || 0;
    const total = children.reduce(
      (sum, child) => sum + usedWidth(child, depth + 1),
      gap * (children.length - 1),
    );
    return Math.min(width, total);
  }

  if (
    style.display !== "block" ||
    children.some((child) =>
      getComputedStyle(child).display.startsWith("inline"),
    )
  ) {
    return width;
  }
  return Math.max(...children.map((child) => usedWidth(child, depth + 1)));
}

/** Sections where the page needs the full width and ads would be in the way. */
const HIDDEN_ON = ["/admin", "/login", "/signup", "/forgot-password"];

/**
 * A stack of 320x100 banners. The root layout stays mounted between pages, so
 * the next set of banners rotates in on every page change.
 */
export function SmallBannerRail({
  banners,
  show,
  embedded = false,
  start = 0,
  side = "right",
  strip = false,
}: {
  banners: SmallBanner[];
  show: number;
  /** Inside a page's own right column rather than the site-wide rail. */
  embedded?: boolean;
  /** Index of the first banner, so two stacks on one page differ. */
  start?: number;
  /** Which side of the page the site-wide rail sits on. */
  side?: "left" | "right";
  /**
   * A row under the page for wide screens where neither the site-wide rail
   * nor a page's own column shows small banners.
   */
  strip?: boolean;
}) {
  const pathname = usePathname();
  const [offset, setOffset] = useState(start);
  const firstPath = useRef(pathname);
  const railRef = useRef<HTMLElement>(null);
  const [roomFor, setRoomFor] = useState<string | null>(null);
  const hasRoom = roomFor === pathname;
  const [columns, setColumns] = useState(4);
  const count = strip ? columns : show;

  useEffect(() => {
    if (embedded || !strip) return;

    const check = () => {
      const shown = Array.from(
        document.querySelectorAll("[data-small-banners]"),
      ).some(
        (element) =>
          !railRef.current?.contains(element) &&
          element.getClientRects().length > 0,
      );
      setColumns(window.innerWidth >= 1280 ? 4 : 3);
      setRoomFor(
        pathname !== "/" && window.innerWidth >= 1024 && !shown
          ? pathname
          : null,
      );
    };

    check();
    const settle = window.setTimeout(check, 700);
    window.addEventListener("resize", check);
    window.addEventListener(RAIL_CHANGED, check);
    return () => {
      window.clearTimeout(settle);
      window.removeEventListener("resize", check);
      window.removeEventListener(RAIL_CHANGED, check);
    };
  }, [pathname, embedded, strip]);

  useEffect(() => {
    if (!embedded && !strip) window.dispatchEvent(new Event(RAIL_CHANGED));
  }, [hasRoom, embedded, strip]);

  useEffect(() => {
    if (embedded || strip) return;
    const rail = railRef.current;
    const page =
      side === "left" ? rail?.nextElementSibling : rail?.previousElementSibling;
    const main = rail?.parentElement;
    if (!page || !main) return;

    const check = () => {
      const mainStyle = getComputedStyle(main);
      const inner =
        main.clientWidth -
        parseFloat(mainStyle.paddingLeft) -
        parseFloat(mainStyle.paddingRight);
      setRoomFor(
        pathname !== "/" &&
          window.innerWidth >= 1280 &&
          !page.querySelector("[data-right-rail]") &&
          usedWidth(page) + RAIL_SPACE * (side === "left" ? 2 : 1) < inner - 2
          ? pathname
          : null,
      );
    };

    check();
    const settle = window.setTimeout(check, 600);
    const observer = new ResizeObserver(check);
    observer.observe(page);
    window.addEventListener("resize", check);
    return () => {
      window.clearTimeout(settle);
      observer.disconnect();
      window.removeEventListener("resize", check);
    };
  }, [pathname, embedded, side, strip]);

  useEffect(() => {
    if (pathname === firstPath.current) return;
    firstPath.current = pathname;
    setOffset((value) => value + show);
  }, [pathname, show]);

  if (!embedded && HIDDEN_ON.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  const visible = Array.from(
    { length: Math.min(count, banners.length) },
    (_, index) => banners[(offset + index) % banners.length],
  );
  const house = Array.from(
    { length: count - visible.length },
    (_, index) => HOUSE_BANNERS[(offset + index) % HOUSE_BANNERS.length],
  );

  const label = visible.length ? "Sponsored" : "Explore GoDesi";
  const tiles = (
    <>
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
            className="h-full w-full object-cover"
          />
        </a>
      ))}
      {house.map((banner) => (
        <Link
          key={banner.slug}
          href={banner.href}
          data-house-banner={banner.slug}
          className={`relative flex aspect-[3/1] w-full items-center gap-3 overflow-hidden rounded-xl bg-gradient-to-br px-4 text-white shadow-sm transition hover:shadow-md ${banner.colors}`}
        >
          <span
            aria-hidden
            className="absolute -right-5 -top-6 h-20 w-20 rounded-full bg-white/15"
          />
          <span
            aria-hidden
            className="absolute -bottom-8 right-10 h-16 w-16 rounded-full bg-white/10"
          />
          <span aria-hidden className="text-4xl drop-shadow">
            {banner.emoji}
          </span>
          <span className="relative min-w-0">
            <span className="block text-lg font-black leading-tight">
              {banner.title}
            </span>
            <span className="block text-xs leading-snug text-white/90">
              {banner.line}
            </span>
            <span className="mt-1 inline-block rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold">
              GoDesi.com →
            </span>
          </span>
        </Link>
      ))}
    </>
  );

  const stack = (
    <div className="space-y-3" aria-label="Sponsored" data-small-banners>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      {tiles}
      <Link
        href="/advertise?slot=MOBILE#book"
        className="flex aspect-[16/5] w-full items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white px-3 text-center text-xs font-semibold text-slate-500 hover:border-indigo-400 hover:text-indigo-600"
      >
        Your 320 × 100 banner here — book this spot
      </Link>
    </div>
  );

  if (embedded) return stack;

  if (strip) {
    return (
      <section
        ref={railRef}
        aria-label="Sponsored"
        className={
          hasRoom ? "mx-auto w-full max-w-screen-2xl px-4 pb-6" : "hidden"
        }
      >
        {hasRoom && (
          <>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {label}
              </p>
              <Link
                href="/advertise?slot=MOBILE#book"
                className="text-xs font-semibold text-slate-500 hover:text-indigo-600 hover:underline"
              >
                Your 320 × 100 banner here — book this spot
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3 xl:grid-cols-4">{tiles}</div>
          </>
        )}
      </section>
    );
  }

  return (
    <aside
      ref={railRef}
      data-site-rail={side}
      className={hasRoom ? "w-[320px] shrink-0" : "hidden"}
    >
      {hasRoom && stack}
    </aside>
  );
}
