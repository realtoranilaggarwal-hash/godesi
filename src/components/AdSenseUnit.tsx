"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type AdsByGoogle = { push: (config: Record<string, unknown>) => void };

declare global {
  interface Window {
    adsbygoogle?: AdsByGoogle;
  }
}

/**
 * Fills an unsold placement with a Google AdSense unit, so empty inventory still
 * earns. The slot keeps the exact placement height — a responsive unit with no
 * ad to show would otherwise leave a tall blank band at the top of the page —
 * and falls back to our own artwork when Google has nothing to serve.
 */
export function AdSenseUnit({
  client,
  slotId,
  height,
  className = "",
  fallback,
}: {
  client: string;
  slotId: string;
  height: number;
  className?: string;
  /** Shown instead of the empty slot when Google returns no ad. */
  fallback?: ReactNode;
}) {
  const filled = useRef(false);
  const slot = useRef<HTMLModElement>(null);
  const [unfilled, setUnfilled] = useState(false);

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

    const status = new MutationObserver(() => {
      if (element.getAttribute("data-ad-status") === "unfilled") setUnfilled(true);
    });
    status.observe(element, { attributes: true, attributeFilter: ["data-ad-status"] });

    let size: ResizeObserver | undefined;
    if (!fill()) {
      size = new ResizeObserver(() => {
        if (fill()) size?.disconnect();
      });
      size.observe(element);
    }

    return () => {
      status.disconnect();
      size?.disconnect();
    };
  }, []);

  if (unfilled && fallback) return <>{fallback}</>;

  return (
    <div style={{ height, overflow: "hidden" }} className={unfilled ? "hidden" : undefined}>
      <ins
        ref={slot}
        className={`adsbygoogle block ${className}`}
        style={{ display: "block", width: "100%", height }}
        data-ad-client={client}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="false"
      />
    </div>
  );
}
