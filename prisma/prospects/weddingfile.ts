/**
 * Wedding File — NJ, NY and PA wedding vendors and venues.
 *
 * The listing itself is a WordPress index, so the roll call of who exists (and
 * their trade and region) comes from the site's own public JSON, and the street
 * and the vendor's own website come from the profile page. Everything the
 * magazine wrote about them stays theirs.
 */

import {
  entities,
  page,
  pause,
  stateCode,
  type Lead,
  type Reader,
} from "./shared";

const HOST = "weddingfile.com";
const ROOT = `https://${HOST}`;

type Kind = "vendor" | "venue";

type Listing = {
  link?: unknown;
  title?: unknown;
  class_list?: unknown;
};

const PLATFORM =
  /(facebook|instagram|twitter|x\.com|linkedin|youtube|pinterest|tiktok|yelp|google|wa\.me|whatsapp|linktr\.ee|w3\.org|gmpg\.org|wordpress|gravatar)\./;

function title(entry: Listing) {
  const held = entry.title;
  const rendered =
    held && typeof held === "object" && "rendered" in held
      ? (held as { rendered: unknown }).rendered
      : "";
  return typeof rendered === "string" ? entities(rendered) : "";
}

function classes(entry: Listing) {
  return Array.isArray(entry.class_list)
    ? entry.class_list.filter(
        (value): value is string => typeof value === "string",
      )
    : [];
}

/** "vendor-category-bridal-salons" reads back as "Bridal Salons". */
function trade(entry: Listing, kind: Kind) {
  const found = classes(entry).find((value) =>
    value.startsWith(`${kind}-category-`),
  );
  const words = (found ?? "").slice(`${kind}-category-`.length);
  const said = words
    .split("-")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
  return said || (kind === "venue" ? "Wedding Venue" : "Wedding Vendor");
}

/** The region tags carry the state, e.g. "vendor-location-central-nj". */
function state(entry: Listing, kind: Kind) {
  for (const value of classes(entry)) {
    if (!value.startsWith(`${kind}-location-`)) continue;
    const found = stateCode(value.slice(-2));
    if (found) return found;
  }
  return "";
}

async function listings(kind: Kind): Promise<Listing[]> {
  const found: Listing[] = [];
  for (let number = 1; number <= 10; number += 1) {
    const body = await page(
      `${ROOT}/wp-json/wp/v2/${kind}s?per_page=100&page=${number}`,
    );
    await pause();
    if (!body) break;
    let parsed: unknown;
    try {
      parsed = JSON.parse(body);
    } catch {
      break;
    }
    if (!Array.isArray(parsed) || !parsed.length) break;
    for (const entry of parsed) {
      if (entry && typeof entry === "object") found.push(entry as Listing);
    }
    if (parsed.length < 100) break;
  }
  return found;
}

/** The profile page's own-site link, skipping the platforms and this host. */
function ownSite(html: string) {
  for (const match of Array.from(html.matchAll(/href="(https?:\/\/[^"]+)"/g))) {
    const link = match[1];
    // Their address field is a link too, e.g. href="http://234%20Main%20St".
    if (!/\.[a-z]{2,}(\/|$|\?|:)/i.test(link.replace(/%20/g, " "))) continue;
    try {
      const host = new URL(link).hostname.replace(/^www\./, "");
      if (!host.includes(".")) continue;
      if (PLATFORM.test(`${host}.`) || host.endsWith(HOST)) continue;
      return `https://${host}`;
    } catch {
      continue;
    }
  }
  return "";
}

const FIELD =
  /jet-listing-dynamic-(?:field__content|link__label)[^>]*>([^<]+)</g;

/** The profile lists the street, then "Town, ST 07006" in the next block. */
function where(html: string) {
  const lines = Array.from(html.matchAll(FIELD)).map((match) =>
    entities(match[1]),
  );
  const streets = lines.filter((line) => /^\d+\s+\S/.test(line));
  const town = html.match(/<p>\s*([A-Za-z .'-]+),\s*([A-Za-z]{2})\s*\d{5}/);
  return {
    address: streets[0] ?? "",
    city: town ? entities(town[1]) : "",
    state: town ? stateCode(town[2]) : "",
  };
}

export const weddingfile: Reader = {
  host: HOST,
  filter: "vendor, venue, or a slug fragment such as dj",
  async *read(only) {
    const asked = only.filter(
      (word): word is Kind => word === "vendor" || word === "venue",
    );
    const words = only.filter((word) => !asked.includes(word as Kind));
    const kinds: Kind[] = asked.length ? asked : ["vendor", "venue"];

    for (const kind of kinds) {
      const entries = (await listings(kind)).filter((entry) => {
        const link = typeof entry.link === "string" ? entry.link : "";
        if (!link || link.endsWith(`/${kind}s/`)) return false;
        return !words.length || words.some((word) => link.includes(word));
      });
      console.log(`${HOST}: ${entries.length} ${kind} pages`);

      for (const entry of entries) {
        const url = entry.link as string;
        const name = title(entry);
        if (!name) continue;

        const html = await page(url);
        await pause();
        const place = html ? where(html) : { address: "", city: "", state: "" };

        const lead: Lead = {
          name,
          trade: trade(entry, kind),
          sourceUrl: url,
          city: place.city,
          state: place.state || state(entry, kind),
          address: place.address,
          websiteUrl: html ? ownSite(html) : "",
        };
        yield lead;
      }
    }
  },
};
