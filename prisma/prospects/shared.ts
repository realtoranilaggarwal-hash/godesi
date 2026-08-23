/**
 * Shared plumbing for the call-list readers.
 *
 * Every reader takes the same line: a public directory is somebody else's
 * website, so we read it slowly, identify ourselves, and take only facts —
 * who exists, what they do, and how to ring them. Descriptions, photos and
 * logos are theirs and are never copied.
 */

import { US_STATES } from "../../src/lib/eventSearch";

const AGENT =
  "GodesiProspectReader/1.0 (+https://godesi.com; one page every 1.5s)";

/** One page at a time, with a gap, so we never look like a flood. */
export const PAUSE_MS = 1_500;

export function pause(ms = PAUSE_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** A page, or null if it isn't there — a missing page ends a pager. */
export async function page(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": AGENT },
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

export function entities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#0?39;|&apos;|&rsquo;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&#8211;|&ndash;/g, "-")
    .replace(/&[a-z]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** A US number in the shape a moderator can dial, or nothing. */
export function phone(value: string) {
  // Listings sometimes carry the country code twice, e.g. "+1 +1 (281) …".
  const digits = value.replace(/\D+/g, "").replace(/^1+(?=\d{10}$)/, "");
  if (digits.length !== 10) return "";
  // A real US number has no leading 0 or 1 in its area code or exchange, and a
  // page full of 555s or 3333333333 is a placeholder, not a business.
  if (!/^[2-9]\d\d[2-9]/.test(digits)) return "";
  if (/^(\d)\1{9}$/.test(digits)) return "";
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

const STATE_CODES = new Map(
  Object.entries(US_STATES).map(([code, name]) => [name.toLowerCase(), code]),
);

/** Whatever a listing calls the state, as the two letters we store. */
export function stateCode(value: string) {
  const word = value.trim().replace(/\.$/, "");
  if (/^[A-Za-z]{2}$/.test(word) && US_STATES[word.toUpperCase()]) {
    return word.toUpperCase();
  }
  return STATE_CODES.get(word.toLowerCase()) ?? "";
}

/**
 * One business worth ringing. Anything the source doesn't publish is left
 * blank; the importer fills what it can from the business's own website.
 */
export type Lead = {
  name: string;
  /** The trade in the source's words, e.g. "Disc Jockey". */
  trade: string;
  /** The public page it was found on. Its uniqueness makes a re-run safe. */
  sourceUrl: string;
  phone?: string;
  email?: string;
  city?: string;
  state?: string;
  address?: string;
  websiteUrl?: string;
};

/** A source of leads: a name for the command line and a slow crawl. */
export type Reader = {
  /** Host we credit the row to, e.g. "localfiles.com". */
  host: string;
  /** What the extra command-line words narrow the crawl to. */
  filter: string;
  read(only: string[]): AsyncGenerator<Lead>;
};
