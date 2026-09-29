import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Card shell with the picture across the top: the whole photo is shown
 * (never cropped) over a blurred copy of itself, so a portrait or logo still
 * fills the band edge to edge and the text below keeps its full width.
 */
export function OrientedTile({
  href,
  src,
  alt,
  imageHeightClass,
  className,
  overlay,
  children,
}: {
  href: string;
  src: string;
  alt: string;
  /** Height of the picture band. */
  imageHeightClass: string;
  className: string;
  /** Absolutely-positioned extras (badges, staff edit). */
  overlay?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={`${className} flex-col`}>
      {overlay}
      <Link
        href={href}
        className={`relative block w-full shrink-0 overflow-hidden bg-slate-800 ${imageHeightClass}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          aria-hidden
          loading="lazy"
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-lg"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="relative h-full w-full object-contain"
        />
      </Link>
      {children}
    </div>
  );
}
