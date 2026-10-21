"use client";

import { useEffect, useRef } from "react";

const WIDGET_SRC =
  "https://tpwdg.com/content?currency=USD&trs=587519&shmarker=792099&locale=en-US&city_id=93&category=4&amount=3&powered_by=true&campaign_id=137&promo_id=4497";

/**
 * Travelpayouts deals widget from the partner dashboard. The script renders
 * its own content where it is appended, so it must be injected client-side —
 * it cannot sit in server-rendered JSX.
 */
export function TravelWidget() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const script = document.createElement("script");
    script.async = true;
    script.charset = "utf-8";
    script.src = WIDGET_SRC;
    host.appendChild(script);
    return () => {
      host.replaceChildren();
    };
  }, []);

  return <div ref={ref} className="min-h-24" />;
}
