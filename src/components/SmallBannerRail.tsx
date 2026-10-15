"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BannerImpression } from "@/components/BannerImpression";

export type SmallBanner = { id: string; title: string; imageUrl: string };

/** Rail width plus the gap beside it. */
const RAIL_SPACE = 320 + 24;

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
  const railRef = useRef<HTMLElement>(null);
  const [hasRoom, setHasRoom] = useState(false);

  useEffect(() => {
    if (embedded) return;
    const rail = railRef.current;
    const page = rail?.previousElementSibling;
    const main = rail?.parentElement;
    if (!page || !main) return;

    const check = () => {
      const mainStyle = getComputedStyle(main);
      const inner =
        main.clientWidth -
        parseFloat(mainStyle.paddingLeft) -
        parseFloat(mainStyle.paddingRight);
      setHasRoom(
        pathname !== "/" &&
          window.innerWidth >= 1280 &&
          !page.querySelector("[data-right-rail]") &&
          usedWidth(page) + RAIL_SPACE < inner - 2,
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
  }, [pathname, embedded]);

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
    <aside
      ref={railRef}
      data-site-rail
      className={hasRoom ? "w-[320px] shrink-0" : "hidden"}
    >
      {hasRoom && stack}
    </aside>
  );
}
