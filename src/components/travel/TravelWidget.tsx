"use client";

import { useEffect, useRef } from "react";

const DEALS_SRC =
  "https://tpwdg.com/content?currency=USD&trs=587519&shmarker=792099&locale=en-US&city_id=93&category=4&amount=3&powered_by=true&campaign_id=137&promo_id=4497";

const MAP_SRC =
  "https://tpwdg.com/content?currency=USD&trs=587519&shmarker=792099&lat=51.5073509&lng=-0.1277583&powered_by=true&search_host=travel.godesi.com%2Fflights&locale=en&origin=LON&value_min=0&value_max=1000000&round_trip=true&only_direct=false&radius=1&draggable=true&disable_zoom=false&show_logo=true&scrollwheel=false&primary=%233FABDB&secondary=%233FABDB&light=%23ffffff&width=1500&height=500&zoom=2&promo_id=4054&campaign_id=100";

const TICKER_SRC =
  "https://tpwdg.com/content?currency=usd&trs=587519&shmarker=792099&destination=DEL&target_host=travel.godesi.com%2Fflights&locale=en&limit=6&powered_by=true&primary=%230085FF&promo_id=4044&campaign_id=100";

const SCHEDULE_SRC =
  "https://tpwdg.com/content?currency=usd&trs=587519&shmarker=792099&color_button=%23FF0000&target_host=travel.godesi.com%2Fflights&locale=en&powered_by=true&origin=NYC&destination=DEL&with_fallback=false&non_direct_flights=true&min_lines=5&border_radius=0&color_background=%23FFFFFF&color_text=%23000000&color_border=%23FFFFFF&promo_id=2811&campaign_id=100";

const SEARCH_SRC =
  "https://tpwdg.com/content?currency=usd&trs=587519&shmarker=792099&show_hotels=true&powered_by=true&locale=en&searchUrl=travel.godesi.com%2Fflights&primary_override=%2332a8dd&color_button=%2332a8dd&color_icons=%2332a8dd&dark=%23262626&light=%23FFFFFF&secondary=%23FFFFFF&special=%23C4C4C4&color_focused=%2332a8dd&border_radius=0&no_labels=&plain=false&promo_id=7879&campaign_id=100";

const TOURS_SRC =
  "https://tpwdg.com/content?trs=587519&shmarker=792099&locale=en&city_id=5128581&tours=3&powered_by=true&campaign_id=150&promo_id=4489";

const BADGE_SRC =
  "https://tpwdg.com/content?trs=587519&shmarker=792099&locale=en&width=100&height=100&powered_by=true&campaign_id=10&promo_id=2082";

const ESIM_SRC =
  "https://tpwdg.com/content?trs=587519&shmarker=792099&locale=en&country=India&powered_by=true&color_button=%23f2685f&color_focused=%23f2685f&secondary=%23FFFFFF&dark=%2311100f&light=%23FFFFFF&special=%23C4C4C4&border_radius=5&plain=false&no_labels=true&promo_id=8588&campaign_id=541";

const SOURCES = {
  deals: DEALS_SRC,
  map: MAP_SRC,
  ticker: TICKER_SRC,
  schedule: SCHEDULE_SRC,
  search: SEARCH_SRC,
  tours: TOURS_SRC,
  badge: BADGE_SRC,
  esim: ESIM_SRC,
};

/**
 * Travelpayouts widgets from the partner dashboard. The scripts render their
 * own content where they are appended, so they must be injected client-side —
 * they cannot sit in server-rendered JSX.
 */
export function TravelWidget({
  variant = "deals",
}: {
  variant?: keyof typeof SOURCES;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const script = document.createElement("script");
    script.async = true;
    script.charset = "utf-8";
    script.src = SOURCES[variant];
    host.appendChild(script);
    return () => {
      host.replaceChildren();
    };
  }, [variant]);

  return (
    <div
      ref={ref}
      className={variant === "map" ? "min-h-64 overflow-hidden" : "min-h-24"}
      data-widget={variant}
    />
  );
}
