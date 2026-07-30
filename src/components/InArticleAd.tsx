"use client";

import { useEffect, useRef } from "react";

/**
 * Google's in-article (fluid) unit. Unlike the fixed banner placements it has no
 * declared height — Google sizes it to the surrounding text — so it is dropped
 * straight into article bodies and quiet list pages instead of a banner box.
 */
export function InArticleAd({ className = "" }: { className?: string }) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const slotId = process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE;
  const slot = useRef<HTMLModElement>(null);
  const filled = useRef(false);

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
    const size = new ResizeObserver(() => {
      if (fill()) size.disconnect();
    });
    size.observe(element);
    return () => size.disconnect();
  }, []);

  if (!client || !slotId) return null;

  return (
    <div className={className}>
      <ins
        ref={slot}
        className="adsbygoogle block"
        style={{ display: "block", textAlign: "center" }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client={client}
        data-ad-slot={slotId}
      />
    </div>
  );
}
