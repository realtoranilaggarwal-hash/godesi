import { headers } from "next/headers";

export type RequestGeo = {
  city: string | null;
  country: string | null;
  timezone: string | null;
  latitude: number | null;
  longitude: number | null;
};

function num(value: string | null) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Where the visitor is, as Vercel's edge reports it. Everything is optional:
 * local development and other hosts send none of these headers.
 */
export function requestGeo(): RequestGeo {
  const head = headers();
  const city = head.get("x-vercel-ip-city");

  return {
    city: city ? decodeURIComponent(city) : null,
    country: head.get("x-vercel-ip-country"),
    timezone: head.get("x-vercel-ip-timezone"),
    latitude: num(head.get("x-vercel-ip-latitude")),
    longitude: num(head.get("x-vercel-ip-longitude")),
  };
}

function hourIn(timezone: string | null) {
  try {
    return Number(
      new Intl.DateTimeFormat("en-GB", {
        hour: "numeric",
        hour12: false,
        timeZone: timezone ?? "UTC",
      }).format(new Date()),
    );
  } catch {
    // An unknown timezone header is no reason to fail the whole header bar.
    return new Date().getUTCHours();
  }
}

/** Morning / afternoon / evening in the visitor's own timezone. */
export function greetingFor(timezone: string | null) {
  const hour = hourIn(timezone);

  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}
