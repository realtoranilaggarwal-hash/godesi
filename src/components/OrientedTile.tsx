"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Card shell whose picture placement follows the photo: a landscape shot runs
 * across the top, a portrait or square one stands full-height on the left with
 * the text beside it, so neither gets shrunk to fit the other's box.
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
  /** Height of the picture band in the landscape layout. */
  imageHeightClass: string;
  className: string;
  /** Absolutely-positioned extras (badges, staff edit). */
  overlay?: ReactNode;
  children: ReactNode;
}) {
  const ref = useRef<HTMLImageElement>(null);
  const [portrait, setPortrait] = useState(false);

  const measure = () => {
    const img = ref.current;
    if (img && img.naturalWidth && img.naturalHeight) {
      setPortrait(img.naturalHeight / img.naturalWidth > 0.9);
    }
  };
  useEffect(() => {
    if (ref.current?.complete) measure();
  }, []);

  return (
    <div className={`${className} ${portrait ? "flex-row" : "flex-col"}`}>
      {overlay}
      <Link
        href={href}
        className={`relative block shrink-0 overflow-hidden bg-slate-800 ${
          portrait ? "w-[42%] self-stretch" : `w-full ${imageHeightClass}`
        }`}
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
          ref={ref}
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={measure}
          className={`h-full w-full object-contain ${
            portrait ? "absolute inset-0" : "relative"
          }`}
        />
      </Link>
      {children}
    </div>
  );
}
