/**
 * Reads an event page someone pasted — a Facebook event, a Sulekha listing, an
 * organiser's own page — and pulls out the facts we show: what, when, where.
 * Nothing is saved until a person confirms it, because pages lie and some
 * (Facebook especially) answer a robot with a login wall.
 */

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

const PRIVATE_HOST =
  /^(localhost$|0\.|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1)/i;

function plainText(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function meta(page: string, property: string) {
  const pattern = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']`,
    "i",
  );
  const reversed = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${property}["']`,
    "i",
  );
  return plainText(pattern.exec(page)?.[1] ?? reversed.exec(page)?.[1] ?? "");
}

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

type Json = Record<string, unknown>;

function isJson(value: unknown): value is Json {
  return typeof value === "object" && value !== null;
}

/** Walks @graph and arrays, which is how most sites nest their JSON-LD. */
function flatten(node: unknown, out: Json[] = []) {
  if (Array.isArray(node)) {
    for (const item of node) flatten(item, out);
  } else if (isJson(node)) {
    out.push(node);
    flatten(node["@graph"], out);
  }
  return out;
}

function eventLd(page: string) {
  const pattern =
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (let block = pattern.exec(page); block; block = pattern.exec(page)) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(block[1].trim());
    } catch {
      continue;
    }
    for (const node of flatten(parsed)) {
      const type = node["@type"];
      const types = Array.isArray(type) ? type : [type];
      if (types.some((item) => typeof item === "string" && /Event$/i.test(item))) {
        return node;
      }
    }
  }
  return null;
}

function text(value: unknown) {
  return typeof value === "string" ? plainText(value) : "";
}

/** schema.org place: a name plus a postal address, either nested or flat. */
function place(node: unknown) {
  if (!isJson(node)) return { venue: "", address: "", city: "", state: "" };
  const postal = isJson(node.address) ? node.address : {};
  const street = isJson(node.address) ? text(postal.streetAddress) : text(node.address);
  return {
    venue: text(node.name),
    address: [street, text(postal.addressLocality), text(postal.addressRegion)]
      .filter(Boolean)
      .join(", "),
    city: text(postal.addressLocality),
    state: text(postal.addressRegion),
  };
}

export async function readEventLink(link: string): Promise<EventDraft> {
  const target = new URL(link);
  const blocked =
    PRIVATE_HOST.test(target.hostname) && process.env.NODE_ENV === "production";
  if (!/^https?:$/.test(target.protocol) || blocked) {
    throw new Error("Paste a public event page, starting with https://");
  }

  const response = await fetch(target.toString(), {
    // Announced honestly: sites that would rather not be read can say no.
    headers: {
      "User-Agent": "GodesiEventReader/1.0 (+https://godesi.com)",
      Accept: "text/html,application/xhtml+xml",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`That page answered HTTP ${response.status}`);
  const page = (await response.text()).slice(0, 800_000);

  const ld = eventLd(page);
  const where = place(ld?.location);
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
