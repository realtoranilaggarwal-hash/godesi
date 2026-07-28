"use client";

import { useEffect, useRef } from "react";

type AdsByGoogle = { push: (config: Record<string, unknown>) => void };

declare global {
  interface Window {
    adsbygoogle?: AdsByGoogle;
  }
}

/**
 * Fills an unsold placement with a Google AdSense unit, so empty inventory still
 * earns. Renders nothing until both the publisher id and a slot id are set.
 */
export function AdSenseUnit({
  client,
  slotId,
  height,
  className = "",
}: {
  client: string;
  slotId: string;
  height: number;
  className?: string;
}) {
  const filled = useRef(false);
  const slot = useRef<HTMLModElement>(null);

  /** AdSense throws when the slot is still 0px wide, so wait for a real width. */
  useEffect(() => {
    const element = slot.current;
    if (!element) return;

    const fill = () => {
      if (filled.current || element.clientWidth < 1) return false;
      filled.current = true;
      try {
        window.adsbygoogle?.push({});
      } catch {
        // An ad failing to load must never take the page down.
      }
      return true;
    };

    if (fill()) return;
    const observer = new ResizeObserver(() => {
      if (fill()) observer.disconnect();
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <ins
      ref={slot}
      className={`adsbygoogle block ${className}`}
      style={{ display: "block", minHeight: height }}
      data-ad-client={client}
      data-ad-slot={slotId}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
