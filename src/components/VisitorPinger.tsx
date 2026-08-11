"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Sends one anonymous ping per page so the live visitor map has data. */
export function VisitorPinger() {
  const pathname = usePathname();

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetch("/api/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pathname }),
        keepalive: true,
      }).catch(() => undefined);
    }, 1200);
    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
