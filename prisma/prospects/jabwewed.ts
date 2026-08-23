import { entities, page, pause, phone, type Lead, type Reader } from "./shared";

/**
 * jabwewed.com — a Houston wedding marketplace. Small (about 290 vendors) but
 * every one is a paying-attention wedding business, and each profile publishes
 * machine-readable facts: name, telephone, street address and the vendor's own
 * links. We read those and nothing else.
 *
 *   npm run db:prospects -- jabwewed
 *   npm run db:prospects -- jabwewed caterers djs-mcs
 */

const ROOT = "https://jabwewed.com";

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
  makesOffer?: unknown;
};

function text(value: unknown) {
  return typeof value === "string" ? entities(value) : "";
}

function postal(value: unknown): Postal {
  return value && typeof value === "object" ? (value as Postal) : {};
}

/** The vendor's own site, told apart from its social profiles. */
function ownSite(value: unknown) {
  const links = Array.isArray(value) ? value : [value];
  for (const link of links) {
    if (typeof link !== "string") continue;
    try {
      const host = new URL(link).hostname.replace(/^www\./, "");
      if (
        !/(facebook|instagram|twitter|x\.com|linkedin|youtube|pinterest|tiktok|yelp|google|jabwewed)\./.test(
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

/** Every business the page describes to search engines, in its own words. */
function businesses(html: string): Business[] {
  const found: Business[] = [];
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
      const business = node as Business;
      if (JSON.stringify(business["@type"] ?? "").includes("LocalBusiness")) {
        found.push(business);
      }
    }
  }
  return found;
}

/** Vendor profile URLs, from the sitemap the site publishes for crawlers. */
async function profiles() {
  const xml = await page(`${ROOT}/sitemap-vendors.xml`);
  if (!xml) return [];
  return Array.from(xml.matchAll(/<loc>([^<]*\/vendors\/[^<]*)<\/loc>/g)).map(
    (match) => match[1],
  );
}

export const jabwewed: Reader = {
  host: "jabwewed.com",
  filter: "slug fragment, e.g. caterers",
  async *read(only) {
    const urls = (await profiles()).filter(
      (url) => !only.length || only.some((word) => url.includes(word)),
    );
    console.log(`jabwewed.com: ${urls.length} vendor profiles`);

    for (const url of urls) {
      const html = await page(url);
      await pause();
      if (!html) continue;

      const [business] = businesses(html);
      if (!business) continue;
      const name = text(business.name);
      if (!name) continue;

      const where = postal(business.address);
      // The category is in the path: /vendors/<slug>, so the trade comes from
      // the page's own breadcrumb wording instead.
      const trade = entities(
        html.match(/breadcrumb[\s\S]{0,400}?\/marketplace\/([a-z-]+)/)?.[1]?.replace(
          /-/g,
          " ",
        ) ?? "wedding",
      );

      yield {
        name,
        trade,
        sourceUrl: url,
        phone: phone(text(business.telephone)),
        email: text(business.email).replace(/^mailto:/i, ""),
        city: text(where.addressLocality),
        state: text(where.addressRegion),
        address: text(where.streetAddress),
        websiteUrl: ownSite(business.sameAs),
      };
    }
  },
};
