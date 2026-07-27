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

  useEffect(() => {
    if (filled.current) return;
    filled.current = true;
    window.adsbygoogle?.push({});
  }, []);

  return (
    <ins
      className={`adsbygoogle block ${className}`}
      style={{ display: "block", minHeight: height }}
      data-ad-client={client}
      data-ad-slot={slotId}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
