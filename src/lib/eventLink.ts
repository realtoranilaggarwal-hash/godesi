/**
 * Reads an event page someone pasted — a Facebook event, a directory listing, an
 * organiser's own page — and pulls out the facts we show: what, when, where.
 * Nothing is saved until a person confirms it, because pages lie and some
 * (Facebook especially) answer a robot with a login wall.
 */

import { address, findLd, meta, readPage, text } from "@/lib/pageRead";

/** A date and time exactly as the page writes it, e.g. 2026-08-21 and 22:30. */
export type WallClock = { date: string; time: string };

export type EventDraft = {
  sourceUrl: string;
  host: string;
  title: string;
  description: string;
  /**
   * The event's own local time, kept as the page states it. A page saying
   * "2026-08-21T22:30:00-04:00" means half ten at night in New York, and that
   * is what the desk should see — not the same instant read somewhere else.
   */
  start: WallClock | null;
  end: WallClock | null;
  venue: string;
  address: string;
  city: string;
  state: string;
  imageUrl: string;
  /** What we could not read, so the desk knows to type it in. */
  missing: string[];
};

function wallClock(value: unknown): WallClock | null {
  if (typeof value !== "string") return null;
  const iso = /^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(value.trim());
  if (iso) return { date: iso[1], time: iso[2] ? `${iso[2]}:${iso[3]}` : "" };

  // Something like "August 21, 2026 10:30 PM": read it as written, which is
  // what the page means, so it is stated as UTC to stop the server's own zone
  // shifting it.
  const parsed = new Date(`${value.trim()} UTC`);
  if (Number.isNaN(parsed.getTime())) return null;
  const stamp = parsed.toISOString();
  return { date: stamp.slice(0, 10), time: stamp.slice(11, 16) };
}

export async function readEventLink(link: string): Promise<EventDraft> {
  const { target, page } = await readPage(link);

  const ld = findLd(page, /Event$/i);
  const where = address(ld?.location);
  const draft: EventDraft = {
    sourceUrl: target.toString(),
    host: target.hostname.replace(/^www\./, ""),
    title: text(ld?.name) || meta(page, "og:title") || "",
    description: (
      text(ld?.description) ||
      meta(page, "og:description") ||
      meta(page, "description")
    ).slice(0, 2000),
    start: wallClock(ld?.startDate),
    end: wallClock(ld?.endDate),
    venue: where.venue,
    address: where.address,
    city: where.city,
    state: where.state,
    imageUrl: meta(page, "og:image"),
    missing: [],
  };

  if (!draft.title) draft.missing.push("title");
  if (!draft.start) draft.missing.push("date and time");
  if (!draft.venue) draft.missing.push("venue");
  if (!draft.city) draft.missing.push("city");
  return draft;
}
