import { requestGeo } from "@/lib/geo";
import {
  DEFAULT_PANCHANG_CITY,
  computePanchang,
  todayIn,
} from "@/lib/panchang";

function validZone(zone: string | null) {
  if (!zone) return null;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: zone });
    return zone;
  } catch {
    return null;
  }
}

/** Today's panchang where the visitor is (per Vercel's edge), or New York when unknown. */
export function visitorPanchang() {
  const geo = requestGeo();
  const timeZone = validZone(geo.timezone);
  if (timeZone && geo.latitude !== null && geo.longitude !== null) {
    const place = {
      latitude: geo.latitude,
      longitude: geo.longitude,
      timeZone,
    };
    return {
      panchang: computePanchang(place, todayIn(timeZone)),
      label: geo.city ?? "your area",
      citySlug: null,
    };
  }
  const city = DEFAULT_PANCHANG_CITY;
  return {
    panchang: computePanchang(city, todayIn(city.timeZone)),
    label: city.name,
    citySlug: city.slug,
  };
}
