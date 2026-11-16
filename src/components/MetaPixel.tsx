"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  push: Fbq;
  loaded: boolean;
  version: string;
  disablePushState?: boolean;
};

/** Pages whose URL carries a ticket code, token, payment reference or email, or that are account-only; never reported to Meta. */
const PRIVATE_PATH =
  /^\/(tickets|unsubscribe|website\/(look|build)|login|forgot-password|verify-email|dashboard|admin|pricing\/(upi|success)|gigs\/orders|book\/[^/]+\/done)(\/|$)/;

function loadPixel(id: string): Fbq {
  const w = window as unknown as { fbq?: Fbq; _fbq?: Fbq };
  if (w.fbq) return w.fbq;
  const n = function (...args: unknown[]) {
    if (n.callMethod) n.callMethod(...args);
    else n.queue.push(args);
  } as Fbq;
  n.push = n;
  n.loaded = true;
  n.version = "2.0";
  n.queue = [];
  // We send PageView on route changes ourselves, so the pixel must not auto-track history changes.
  n.disablePushState = true;
  w.fbq = n;
  if (!w._fbq) w._fbq = n;
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(s);
  n("set", "autoConfig", false, id);
  n("init", id);
  return n;
}

/** Meta Pixel PageView on every client-side navigation, skipping private pages. */
export function MetaPixel({ id }: { id: string }) {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname || PRIVATE_PATH.test(pathname)) return;
    loadPixel(id)("track", "PageView");
  }, [id, pathname]);
  return null;
}
