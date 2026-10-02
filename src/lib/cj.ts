/**
 * CJ Affiliate Link Search (https://developers.cj.com/docs/rest-apis/link-search):
 * promotions from the advertisers GoDesi has joined, already carrying our
 * publisher id in the tracking URL. Responses are XML.
 */

import { db } from "@/lib/db";

const ENDPOINT = "https://link-search.api.cj.com/v2/link-search";
/** Promotion types worth showing as a deal; one request each, as the API takes a single value. */
const PROMOTION_TYPES = ["coupon", "sale/discount", "free shipping"] as const;
const PAGE_SIZE = 100;
/** CJ allows 25 calls a minute; three types × three pages stays well under. */
const MAX_PAGES = 3;

export function cjConfig() {
  const token = process.env.CJ_API_TOKEN?.trim();
  const websiteId = process.env.CJ_WEBSITE_ID?.trim();
  return token && websiteId ? { token, websiteId } : null;
}

export type CjOffer = {
  externalId: string;
  advertiserId: string;
  advertiserName: string;
  title: string;
  description: string | null;
  code: string | null;
  promotionType: string | null;
  category: string | null;
  clickUrl: string;
  startsAt: Date | null;
  endsAt: Date | null;
  countries: string[];
};

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
};

function decode(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
      if (entity[0] === "#") {
        const code =
          entity[1].toLowerCase() === "x"
            ? parseInt(entity.slice(2), 16)
            : parseInt(entity.slice(1), 10);
        return Number.isFinite(code) ? String.fromCodePoint(code) : match;
      }
      return ENTITIES[entity.toLowerCase()] ?? match;
    })
    .trim();
}

function field(block: string, name: string) {
  const match = block.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
  if (!match) return null;
  const value = decode(match[1]);
  return value && !["N/A", "NULL"].includes(value.toUpperCase()) ? value : null;
}

function parseDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value.replace(" ", "T").replace(/\.\d+$/, ""));
  return Number.isNaN(date.getTime()) ? null : date;
}

function httpsUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

/** The tracking URL: `clickUrl` when CJ sends it, else the href in the HTML link code. */
function clickUrlOf(block: string) {
  const direct = httpsUrl(field(block, "clickUrl"));
  if (direct) return direct;
  const html = field(block, "link-code-html") ?? "";
  const href = decode(html).match(/href="([^"]+)"/i)?.[1] ?? null;
  return httpsUrl(href);
}

export function parseLinkSearch(xml: string): {
  offers: CjOffer[];
  totalMatched: number;
} {
  const error = xml.match(/<error-message>([\s\S]*?)<\/error-message>/);
  if (error) throw new Error(`CJ: ${decode(error[1])}`);

  const totalMatched = Number(
    xml.match(/<links[^>]*total-matched="(\d+)"/)?.[1] ?? 0,
  );
  const offers: CjOffer[] = [];
  for (const [, block] of Array.from(
    xml.matchAll(/<link>([\s\S]*?)<\/link>/g),
  )) {
    const externalId = field(block, "link-id");
    const advertiserId = field(block, "advertiser-id");
    const advertiserName = field(block, "advertiser-name");
    const title = field(block, "link-name");
    const clickUrl = clickUrlOf(block);
    if (!externalId || !advertiserId || !advertiserName || !title || !clickUrl)
      continue;
    const description = field(block, "description");
    offers.push({
      externalId,
      advertiserId,
      advertiserName,
      title: title.slice(0, 200),
      description:
        description && description !== title ? description.slice(0, 600) : null,
      code: field(block, "coupon-code")?.slice(0, 60) ?? null,
      promotionType: field(block, "promotion-type"),
      category: field(block, "category"),
      clickUrl,
      startsAt: parseDate(field(block, "promotion-start-date")),
      endsAt: parseDate(field(block, "promotion-end-date")),
      countries: (field(block, "targeted-countries") ?? "")
        .split(/[,\s]+/)
        .map((country) => country.trim().toUpperCase())
        .filter(Boolean),
    });
  }
  return { offers, totalMatched };
}

async function searchPage(
  config: { token: string; websiteId: string },
  promotionType: string,
  page: number,
) {
  const url = new URL(ENDPOINT);
  url.searchParams.set("website-id", config.websiteId);
  url.searchParams.set("advertiser-ids", "joined");
  url.searchParams.set("promotion-type", promotionType);
  url.searchParams.set("records-per-page", String(PAGE_SIZE));
  url.searchParams.set("page-number", String(page));
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${config.token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  const xml = await response.text();
  if (!response.ok && !xml.includes("<error-message>"))
    throw new Error(`CJ: HTTP ${response.status}`);
  return parseLinkSearch(xml);
}

/** US-visible offers that haven't ended, de-duplicated by link id. */
export async function fetchCjOffers(
  config: { token: string; websiteId: string },
  now = new Date(),
) {
  const byId = new Map<string, CjOffer>();
  for (const type of PROMOTION_TYPES) {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const { offers, totalMatched } = await searchPage(config, type, page);
      for (const offer of offers) {
        if (offer.endsAt && offer.endsAt < now) continue;
        if (offer.countries.length && !offer.countries.includes("US")) continue;
        byId.set(offer.externalId, offer);
      }
      if (page * PAGE_SIZE >= totalMatched || !offers.length) break;
    }
  }
  return Array.from(byId.values());
}

/**
 * Upserts the feed and switches off anything CJ no longer returns. Staff
 * "hidden" choices survive re-syncs.
 */
export async function syncCjOffers() {
  const config = cjConfig();
  if (!config) return { skipped: "CJ_API_TOKEN / CJ_WEBSITE_ID not set" };

  const offers = await fetchCjOffers(config);
  const syncedAt = new Date();
  for (const offer of offers) {
    const data = {
      advertiserId: offer.advertiserId,
      advertiserName: offer.advertiserName,
      title: offer.title,
      description: offer.description,
      code: offer.code,
      promotionType: offer.promotionType,
      category: offer.category,
      clickUrl: offer.clickUrl,
      startsAt: offer.startsAt,
      endsAt: offer.endsAt,
      active: true,
      syncedAt,
    };
    await db.storeOffer.upsert({
      where: {
        source_externalId: { source: "CJ", externalId: offer.externalId },
      },
      create: { source: "CJ", externalId: offer.externalId, ...data },
      update: data,
    });
  }
  const retired = await db.storeOffer.updateMany({
    where: { source: "CJ", active: true, syncedAt: { lt: syncedAt } },
    data: { active: false },
  });
  return { fetched: offers.length, retired: retired.count };
}
