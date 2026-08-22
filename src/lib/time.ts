/**
 * Time zones for events. A community event is announced in the wall-clock time
 * of the town it happens in, so every event carries the zone it was written in
 * and is displayed back in that same zone, wherever the reader is.
 */

/** What events written before zones were recorded were interpreted as. */
export const LEGACY_EVENT_ZONE = "Asia/Kolkata";

/** What a new event defaults to: most of Godesi's events are on the US east coast. */
export const DEFAULT_EVENT_ZONE = "America/New_York";

export const EVENT_TIME_ZONES = [
  { value: "America/New_York", label: "Eastern (New York, NJ, Atlanta)" },
  { value: "America/Chicago", label: "Central (Chicago, Dallas, Houston)" },
  { value: "America/Denver", label: "Mountain (Denver)" },
  { value: "America/Phoenix", label: "Arizona (no daylight saving)" },
  { value: "America/Los_Angeles", label: "Pacific (California, Seattle)" },
  { value: "America/Toronto", label: "Toronto" },
  { value: "America/Vancouver", label: "Vancouver" },
  { value: "Europe/London", label: "United Kingdom" },
  { value: "Asia/Dubai", label: "UAE" },
  { value: "Asia/Kolkata", label: "India" },
  { value: "Australia/Sydney", label: "Sydney" },
] as const;

const ZONE_VALUES: string[] = EVENT_TIME_ZONES.map((zone) => zone.value);

export function isEventZone(value: string) {
  return ZONE_VALUES.includes(value);
}

/**
 * Offset of a named zone at a given instant, so a wall-clock time becomes the
 * right absolute time across daylight saving.
 */
export function zoneOffsetMinutes(zone: string, instant: Date) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).formatToParts(instant);
    const get = (type: string) =>
      Number(parts.find((part) => part.type === type)?.value ?? "0");
    const asUtc = Date.UTC(
      get("year"),
      get("month") - 1,
      get("day"),
      get("hour") % 24,
      get("minute"),
      get("second"),
    );
    return (asUtc - instant.getTime()) / 60_000;
  } catch {
    return 0;
  }
}

/**
 * "2026-12-31" + "20:00" in New York → the instant that is 8pm there. Two
 * passes because the offset itself depends on the instant near a DST boundary.
 */
export function instantFrom(date: string, time: string, zone: string) {
  const stamp = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());
  const clock = /^(\d{2}):(\d{2})/.exec(time.trim());
  if (!stamp || !clock) return null;
  const naive = Date.UTC(
    +stamp[1],
    +stamp[2] - 1,
    +stamp[3],
    +clock[1],
    +clock[2],
  );
  let instant = new Date(naive);
  for (let pass = 0; pass < 2; pass += 1) {
    instant = new Date(naive - zoneOffsetMinutes(zone, instant) * 60_000);
  }
  return Number.isNaN(instant.getTime()) ? null : instant;
}

/** The date and time a form's date/time inputs need to show this instant. */
export function wallClockIn(instant: Date, zone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(instant);
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    // en-CA gives midnight as 24:00, which a time input rejects.
    time: `${get("hour") === "24" ? "00" : get("hour")}:${get("minute")}`,
  };
}

/**
 * Reads an instant's UTC wall clock and returns the instant that shows the
 * same clock in `zone` — for calendar entries that state a time with no zone,
 * which mean the town's own time.
 */
export function placeWallClock(instant: Date, zone: string) {
  const iso = instant.toISOString();
  return instantFrom(iso.slice(0, 10), iso.slice(11, 16), zone) ?? instant;
}

/**
 * Only the states that are not Eastern — anything unlisted, which is most of
 * where desi events happen, falls back to the default. Written as both the
 * postal code and the spelled-out name, because forms carry either.
 */
const STATE_ZONES: Record<string, string> = {
  ca: "America/Los_Angeles",
  california: "America/Los_Angeles",
  wa: "America/Los_Angeles",
  washington: "America/Los_Angeles",
  or: "America/Los_Angeles",
  oregon: "America/Los_Angeles",
  nv: "America/Los_Angeles",
  nevada: "America/Los_Angeles",
  az: "America/Phoenix",
  arizona: "America/Phoenix",
  ut: "America/Denver",
  utah: "America/Denver",
  co: "America/Denver",
  colorado: "America/Denver",
  nm: "America/Denver",
  "new mexico": "America/Denver",
  tx: "America/Chicago",
  texas: "America/Chicago",
  il: "America/Chicago",
  illinois: "America/Chicago",
  mn: "America/Chicago",
  minnesota: "America/Chicago",
  wi: "America/Chicago",
  wisconsin: "America/Chicago",
  mo: "America/Chicago",
  missouri: "America/Chicago",
  ia: "America/Chicago",
  iowa: "America/Chicago",
  ks: "America/Chicago",
  kansas: "America/Chicago",
  ne: "America/Chicago",
  nebraska: "America/Chicago",
  ok: "America/Chicago",
  oklahoma: "America/Chicago",
  ar: "America/Chicago",
  arkansas: "America/Chicago",
  la: "America/Chicago",
  louisiana: "America/Chicago",
  ms: "America/Chicago",
  mississippi: "America/Chicago",
  al: "America/Chicago",
  alabama: "America/Chicago",
  tn: "America/Chicago",
  tennessee: "America/Chicago",
};

const COUNTRY_ZONES: Record<string, string> = {
  india: "Asia/Kolkata",
  in: "Asia/Kolkata",
  uk: "Europe/London",
  "united kingdom": "Europe/London",
  england: "Europe/London",
  canada: "America/Toronto",
  uae: "Asia/Dubai",
  "united arab emirates": "Asia/Dubai",
  australia: "Australia/Sydney",
};

/** The zone an event is most likely written in, from where it happens. */
export function zoneForPlace(state?: string | null, country?: string | null) {
  const byCountry = COUNTRY_ZONES[(country ?? "").trim().toLowerCase()];
  if (byCountry) return byCountry;
  const byState = STATE_ZONES[(state ?? "").trim().toLowerCase()];
  if (byState) return byState;
  return DEFAULT_EVENT_ZONE;
}
