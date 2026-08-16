import { randomBytes } from "crypto";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { parseIcs, type IcsEvent } from "@/lib/ics";
import { placeWallClock, zoneForPlace } from "@/lib/time";

/**
 * Imports community events from the public calendars organisations already
 * publish. Imported events go live immediately and carry a credit back to the
 * calendar they came from; the events desk removes anything that is junk.
 */
export const WIRE_EMAIL = "community-calendar@godesi.com";
/** How far ahead we import. Beyond this, calendars are mostly placeholders. */
export const WIRE_HORIZON_DAYS = 180;
/** Most entries taken from one calendar in a single run. */
export const WIRE_PER_SOURCE = 40;

/** A calendar time that names no zone, so it means the town's own clock. */
function loose(entry: IcsEvent) {
  return entry.floating || entry.allDay;
}

export type WireResult = {
  source: string;
  added: number;
  updated: number;
  skipped: number;
  /// Why a run that imported nothing imported nothing, in the desk's words.
  reason?: string;
  error?: string;
};

/**
 * The account imported events are filed under, so they never look like a
 * member posted them. It cannot be signed into: the password is random and
 * thrown away.
 */
async function wireAccount() {
  const existing = await db.user.findUnique({
    where: { email: WIRE_EMAIL },
    select: { id: true },
  });
  if (existing) return existing.id;

  const created = await db.user.create({
    data: {
      email: WIRE_EMAIL,
      name: "Community calendar",
      passwordHash: await hash(randomBytes(32).toString("hex"), 10),
      role: "CLIENT",
    },
    select: { id: true },
  });
  return created.id;
}

/** The account hand-added links are filed under, same as a calendar import. */
export async function wireOrganizerId() {
  return wireAccount();
}

/**
 * The stand-in "calendar" a hand-pasted link is filed under, one per website,
 * so those events get the same credit-and-no-tickets treatment as an import and
 * can be removed from the same desk. It is never fetched: nightly runs only
 * read active sources.
 */
export async function manualSource(host: string) {
  const url = `manual://${host}`;
  const existing = await db.eventSource.findUnique({
    where: { url },
    select: { id: true },
  });
  if (existing) return existing.id;

  const created = await db.eventSource.create({
    data: {
      name: host,
      url,
      city: "",
      country: "USA",
      active: false,
      lastStatus: "Added by hand from pasted links.",
    },
    select: { id: true },
  });
  return created.id;
}

async function eventSlug(title: string, startsAt: Date) {
  const base =
    slugify(`${title} ${startsAt.toISOString().slice(0, 10)}`) || "event";
  let candidate = base;
  let counter = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await db.event.findUnique({ where: { slug: candidate } })) {
    counter += 1;
    candidate = `${base}-${counter}`;
  }
  return candidate;
}

/** "Sanatan Mandir, 1 Oak Tree Rd, Iselin, NJ 08830" → venue and address. */
function splitLocation(location: string) {
  const parts = location
    .split(/\s*[,\n]\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (!parts.length) return { venue: null, address: null };
  return {
    venue: parts[0].slice(0, 120),
    address: parts.length > 1 ? parts.join(", ").slice(0, 240) : null,
  };
}

/** Calendar descriptions are often HTML; the event page renders plain text. */
function plainText(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function looksLikeJunk(entry: IcsEvent) {
  const title = entry.title.toLowerCase();
  // Calendars are also used as to-do lists and blocked-out time.
  return (
    title.length < 3 ||
    /^(busy|blocked|hold|tentative|closed|reserved|test)\b/.test(title)
  );
}

/**
 * A calendar nobody has updated since last year is the usual reason a run
 * imports nothing, and "50 skipped" alone does not say so.
 */
function skipReason(
  entries: IcsEvent[],
  kept: number,
  now: number,
  horizon: number,
) {
  if (kept || !entries.length) return undefined;
  const newest = Math.max(...entries.map((entry) => entry.startsAt.getTime()));
  if (newest < now) {
    return `every entry is in the past, the last one on ${new Date(newest).toDateString()}. Ask them to update their calendar.`;
  }
  if (entries.every((entry) => entry.startsAt.getTime() > horizon)) {
    return `nothing falls within the next ${WIRE_HORIZON_DAYS} days.`;
  }
  return "every entry looks like blocked-out time rather than an event.";
}

type Source = {
  id: string;
  name: string;
  url: string;
  city: string;
  state: string | null;
  country: string;
  websiteUrl: string | null;
  categorySlugs: string[];
  tags: string[];
};

async function fetchFeed(url: string, timeoutMs = 20_000) {
  const response = await fetch(url, {
    headers: { "User-Agent": "GodesiEventWire/1.0 (+https://godesi.com)" },
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw new Error(`Feed returned HTTP ${response.status}`);
  return response.text();
}

export async function importSource(source: Source): Promise<WireResult> {
  const result: WireResult = {
    source: source.name,
    added: 0,
    updated: 0,
    skipped: 0,
  };

  let entries: IcsEvent[];
  try {
    entries = parseIcs(await fetchFeed(source.url));
  } catch (error) {
    result.error = error instanceof Error ? error.message : "Fetch failed";
    await db.eventSource.update({
      where: { id: source.id },
      data: { lastRunAt: new Date(), lastStatus: `Failed: ${result.error}` },
    });
    return result;
  }

  const organizerId = await wireAccount();
  const now = Date.now();
  const horizon = now + WIRE_HORIZON_DAYS * 86_400_000;

  const upcoming = entries
    .filter((entry) => {
      const at = entry.startsAt.getTime();
      return at > now && at < horizon && !looksLikeJunk(entry);
    })
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
    .slice(0, WIRE_PER_SOURCE);

  result.skipped = entries.length - upcoming.length;
  result.reason = skipReason(entries, upcoming.length, now, horizon);

  const placeZone = zoneForPlace(source.state, source.country);

  for (const entry of upcoming) {
    const place = splitLocation(entry.location);
    const description =
      plainText(entry.description) ||
      `${entry.title} at ${place.venue ?? source.name}.`;
    const zone = entry.zone ?? placeZone;

    const data = {
      title: entry.title,
      description: `${description}\n\nListed from ${source.name}'s public calendar.`.slice(
        0,
        5000,
      ),
      // A floating calendar time is a wall clock with no zone: it means 6pm in
      // the temple's own town, so it is placed there rather than left in UTC.
      startsAt: loose(entry)
        ? placeWallClock(entry.startsAt, zone)
        : entry.startsAt,
      endsAt:
        entry.endsAt && loose(entry)
          ? placeWallClock(entry.endsAt, zone)
          : entry.endsAt,
      timeZone: zone,
      venue: place.venue ?? source.name,
      address: place.address,
      city: source.city,
      state: source.state,
      country: source.country,
      websiteUrl: entry.url ?? source.websiteUrl,
      categorySlugs: source.categorySlugs,
      categorySlug: source.categorySlugs[0] ?? null,
      tags: source.tags,
      // Godesi sells no tickets for an imported event; the organiser does.
      price: 0,
      seatsTotal: 0,
      status: "APPROVED" as const,
    };

    // eslint-disable-next-line no-await-in-loop
    const existing = await db.event.findUnique({
      where: { sourceId_sourceUid: { sourceId: source.id, sourceUid: entry.uid } },
      select: { id: true },
    });

    if (existing) {
      // `status` is deliberately left alone: an event the desk has removed must
      // not come back to life on the next run.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { status, ...refreshable } = data;
      // eslint-disable-next-line no-await-in-loop
      await db.event.update({ where: { id: existing.id }, data: refreshable });
      result.updated += 1;
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    await db.event.create({
      data: {
        ...data,
        slug: await eventSlug(entry.title, entry.startsAt),
        organizerId,
        sourceId: source.id,
        sourceUid: entry.uid,
      },
    });
    result.added += 1;
  }

  await db.eventSource.update({
    where: { id: source.id },
    data: {
      lastRunAt: new Date(),
      lastStatus: [
        `${result.added} added, ${result.updated} updated, ${result.skipped} skipped`,
        result.reason,
      ]
        .filter(Boolean)
        .join(" — "),
    },
  });

  return result;
}

/** Keeps the discovery fetch off our own network. */
const PRIVATE_HOST =
  /^(localhost$|0\.|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1)/i;

/** Where community sites keep their calendar when it is not on the front page. */
const CALENDAR_PAGES = [
  "/events",
  "/events/",
  "/calendar",
  "/calendar/",
  "/upcoming-events",
];

/** Google Calendar's embed code carries the id its .ics address is built from. */
function googleIcsFrom(page: string) {
  const found = new Set<string>();
  const pattern = /calendar\.google\.com\/calendar\/(?:embed|ical)\?[^"'<>\s]*?src=([^"'<>&\s]+)/g;
  let match = pattern.exec(page);
  while (match) {
    const id = decodeURIComponent(match[1]);
    if (id.includes("@")) {
      found.add(
        `https://calendar.google.com/calendar/ical/${encodeURIComponent(id)}/public/basic.ics`,
      );
    }
    match = pattern.exec(page);
  }
  return Array.from(found);
}

/**
 * Given an organisation's website, finds the calendar feed it publishes:
 * a linked .ics file, a Google Calendar embed, or WordPress's The Events
 * Calendar export. Candidates are only returned once they actually parse, so
 * the admin never saves an address that turns out to be a web page.
 */
export async function discoverFeeds(website: string) {
  const target = new URL(website);
  const privateHost =
    PRIVATE_HOST.test(target.hostname) && process.env.NODE_ENV === "production";
  if (!/^https?:$/.test(target.protocol) || privateHost) {
    throw new Error("That address is not a public website.");
  }
  const origin = target.origin;

  // Temples rarely put the calendar on the front page, so the usual event
  // pages are read too.
  const pages = [website, ...CALENDAR_PAGES.map((path) => `${origin}${path}`)];
  const fetched = await Promise.all(
    // Most sites have only one or two of these paths, so a miss is expected.
    pages.map((url) => fetchFeed(url, 8_000).catch(() => "")),
  );
  const page = fetched.join("");
  if (!page) throw new Error("nothing answered at that address");

  const candidates = new Set<string>(googleIcsFrom(page));

  const ics = /https?:\/\/[^"'<>\s]+?\.ics\b/g;
  for (let hit = ics.exec(page); hit; hit = ics.exec(page)) {
    candidates.add(hit[0]);
  }
  const exports_ = /href=["']([^"']*ical=1[^"']*)["']/gi;
  for (let hit = exports_.exec(page); hit; hit = exports_.exec(page)) {
    candidates.add(new URL(hit[1], website).toString());
  }
  // The Events Calendar's standard export, present even when nothing links it.
  candidates.add(`${origin}/events/?ical=1`);

  // A dead candidate is normal — most pages advertise none at all.
  const bodies = await Promise.all(
    Array.from(candidates)
      .slice(0, 8)
      .map(async (url) => ({ url, body: await fetchFeed(url, 8_000).catch(() => "") })),
  );
  return bodies
    .filter((found) => found.body.includes("BEGIN:VEVENT"))
    .map((found) => ({ url: found.url, events: parseIcs(found.body).length }));
}

export async function runEventWire() {
  const sources = await db.eventSource.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
      url: true,
      city: true,
      state: true,
      country: true,
      websiteUrl: true,
      categorySlugs: true,
      tags: true,
    },
  });

  const results: WireResult[] = [];
  for (const source of sources) {
    // Sequential: these are other people's calendars, not an API we bought.
    // eslint-disable-next-line no-await-in-loop
    results.push(await importSource(source));
  }
  return results;
}
