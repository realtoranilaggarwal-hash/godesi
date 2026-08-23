import {
  entities,
  page,
  pause,
  phone,
  stateCode,
  type Lead,
  type Reader,
} from "./shared";

/**
 * indianweddings.org — a US South Asian wedding vendor directory. Every vendor
 * page publishes machine-readable facts for search engines: name, telephone,
 * enquiry email, town, state and the vendor's own website. We read those.
 *
 *   npm run db:prospects -- indianweddings
 *   npm run db:prospects -- indianweddings dallas
 *
 * Their own photos and their own write-ups stay theirs; nothing is copied.
 */

const ROOT = "https://indianweddings.org";

type Postal = {
  streetAddress?: unknown;
  addressLocality?: unknown;
  addressRegion?: unknown;
};

type Business = {
  "@type"?: unknown;
  name?: unknown;
  telephone?: unknown;
  email?: unknown;
  address?: unknown;
  sameAs?: unknown;
};

function text(value: unknown) {
  return typeof value === "string" ? entities(value) : "";
}

function postal(value: unknown): Postal {
  return value && typeof value === "object" ? (value as Postal) : {};
}

/**
 * Their directory forwards enquiries through its own address
 * (contact+slug@indianweddings.org) and stubs the rest, so anything that is not
 * the business's own mailbox is dropped.
 */
function ownEmail(value: string) {
  const email = value.replace(/^mailto:/i, "");
  if (!email.includes("@")) return "";
  const host = email.split("@")[1].toLowerCase();
  const forwarded =
    host.endsWith("indianweddings.org") || host.endsWith("placeholder");
  return forwarded ? "" : email;
}

/** The vendor's own site, told apart from its social profiles. */
function ownSite(value: unknown) {
  const links = Array.isArray(value) ? value : [value];
  for (const link of links) {
    if (typeof link !== "string") continue;
    try {
      const host = new URL(link).hostname.replace(/^www\./, "");
      if (
        !/(facebook|instagram|twitter|x\.com|linkedin|youtube|pinterest|tiktok|yelp|google|indianweddings)\./.test(
          host,
        )
      ) {
        return link;
      }
    } catch {
      continue;
    }
  }
  return "";
}

/** The business each vendor page describes to search engines. */
function business(html: string): Business | null {
  for (const block of Array.from(
    html.matchAll(
      /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    ),
  )) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(entities(block[1]));
    } catch {
      continue;
    }
    const graph =
      parsed && typeof parsed === "object" && "@graph" in parsed
        ? (parsed as { "@graph": unknown })["@graph"]
        : parsed;
    for (const node of Array.isArray(graph) ? graph : [graph]) {
      if (!node || typeof node !== "object") continue;
      const found = node as Business;
      if (JSON.stringify(found["@type"] ?? "").includes("LocalBusiness")) {
        return found;
      }
    }
  }
  return null;
}

/** Vendor pages, from the sitemap they publish for crawlers. */
async function profiles() {
  const xml = await page(`${ROOT}/sitemap.xml`);
  if (!xml) return [];
  return Array.from(xml.matchAll(/<loc>([^<]*\/vendors\/[^<]+)<\/loc>/g))
    .map((match) => match[1])
    .filter((url) => !url.endsWith("/vendors"));
}

export const indianweddings: Reader = {
  host: "indianweddings.org",
  filter: "slug fragment, e.g. dallas or venue",
  async *read(only) {
    const urls = (await profiles()).filter(
      (url) => !only.length || only.some((word) => url.includes(word)),
    );
    console.log(`indianweddings.org: ${urls.length} vendor pages`);

    for (const url of urls) {
      const html = await page(url);
      await pause();
      if (!html) continue;

      const found = business(html);
      if (!found) continue;
      const name = text(found.name);
      if (!name) continue;

      const where = postal(found.address);
      // Their page title ends with the trade, e.g. "… | Indian Wedding Venues".
      const trade = entities(
        html
          .match(/<title>([^<]*)<\/title>/)?.[1]
          ?.split("|")
          .slice(1)
          .join(" ")
          .replace(/indian wedding/i, "")
          .trim() || "wedding",
      );
      const websiteUrl = ownSite(found.sameAs);

      const lead: Lead = {
        name,
        trade,
        sourceUrl: url,
        phone: phone(text(found.telephone)),
        email: ownEmail(text(found.email)),
        city: text(where.addressLocality).replace(/\s+metro$/i, ""),
        state: stateCode(text(where.addressRegion)),
        address: text(where.streetAddress),
        websiteUrl,
      };
      yield lead;
    }
  },
};
