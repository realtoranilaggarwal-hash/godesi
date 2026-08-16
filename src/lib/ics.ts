/**
 * A small iCalendar reader for the public calendars temples, gurudwaras and
 * cultural associations already publish. It reads what we display — when,
 * where, what and a link — and ignores the rest of RFC 5545 rather than
 * pretending to implement it.
 */
import { zoneOffsetMinutes } from "@/lib/time";

export type IcsEvent = {
  uid: string;
  /** Zone the calendar wrote the times in, when it said so. */
  zone: string | null;
  /** A time with no zone at all: a wall clock we have to place ourselves. */
  floating: boolean;
  title: string;
  description: string;
  location: string;
  url: string | null;
  startsAt: Date;
  endsAt: Date | null;
  /** True when the calendar gave a date with no time, e.g. a festival day. */
  allDay: boolean;
};

/** Long values are wrapped onto continuation lines that start with a space. */
function unfold(text: string) {
  return text.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "");
}

function unescapeText(value: string) {
  return value
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\")
    .trim();
}

/** `DTSTART;TZID=America/New_York:20260815T180000` → name, params, value. */
function splitLine(line: string) {
  const colon = line.indexOf(":");
  if (colon === -1) return null;
  const head = line.slice(0, colon);
  const value = line.slice(colon + 1);
  const [name, ...params] = head.split(";");
  return { name: name.toUpperCase(), params, value };
}

function parseDate(value: string, params: string[]) {
  const zone = params
    .find((param) => param.toUpperCase().startsWith("TZID="))
    ?.slice(5);

  const date = value.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (date) {
    const [, year, month, day] = date;
    return {
      date: new Date(Date.UTC(+year, +month - 1, +day, 12)),
      allDay: true,
      zone: zone ?? null,
      floating: false,
    };
  }

  const stamp = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/);
  if (!stamp) return null;
  const [, year, month, day, hour, minute, second, utc] = stamp;
  const naive = Date.UTC(+year, +month - 1, +day, +hour, +minute, +second);
  if (utc) return { date: new Date(naive), allDay: false, zone: null, floating: false };
  if (!zone) {
    // No zone and no Z: a floating wall clock. It is returned as if UTC and
    // flagged, so the importer can place it in the town's own zone.
    return { date: new Date(naive), allDay: false, zone: null, floating: true };
  }
  // Two passes: the offset itself depends on the instant near a DST boundary.
  let guess = new Date(naive);
  for (let pass = 0; pass < 2; pass += 1) {
    guess = new Date(naive - zoneOffsetMinutes(zone, guess) * 60_000);
  }
  return { date: guess, allDay: false, zone, floating: false };
}

export function parseIcs(raw: string, limit = 400): IcsEvent[] {
  const events: IcsEvent[] = [];
  let current: Record<string, { value: string; params: string[] }> | null = null;

  for (const line of unfold(raw).split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "BEGIN:VEVENT") {
      current = {};
      continue;
    }
    if (trimmed === "END:VEVENT") {
      if (current) {
        const event = buildEvent(current);
        if (event) events.push(event);
      }
      current = null;
      if (events.length >= limit) break;
      continue;
    }
    if (!current) continue;

    const parsed = splitLine(trimmed);
    // First value wins, so a stray duplicate cannot overwrite a good one.
    if (parsed && !current[parsed.name]) {
      current[parsed.name] = { value: parsed.value, params: parsed.params };
    }
  }

  return events;
}

function buildEvent(
  fields: Record<string, { value: string; params: string[] }>,
): IcsEvent | null {
  const start = fields.DTSTART
    ? parseDate(fields.DTSTART.value, fields.DTSTART.params)
    : null;
  const title = fields.SUMMARY ? unescapeText(fields.SUMMARY.value) : "";
  if (!start || !title) return null;

  const end = fields.DTEND
    ? parseDate(fields.DTEND.value, fields.DTEND.params)
    : null;
  const url = fields.URL?.value?.trim();

  return {
    uid: (fields.UID?.value ?? `${title}-${start.date.toISOString()}`).slice(
      0,
      200,
    ),
    zone: start.zone,
    floating: start.floating,
    title: title.slice(0, 160),
    description: fields.DESCRIPTION
      ? unescapeText(fields.DESCRIPTION.value).slice(0, 4000)
      : "",
    location: fields.LOCATION ? unescapeText(fields.LOCATION.value) : "",
    url: url && /^https?:\/\//i.test(url) ? url : null,
    startsAt: start.date,
    endsAt: end?.date ?? null,
    allDay: start.allDay,
  };
}
