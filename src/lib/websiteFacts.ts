import {
  EMPTY_FACTS,
  type FoundFacts,
  type WebsiteSources,
} from "@/lib/websiteBuilder";

/**
 * Reads what a business already says about itself on its public pages —
 * website, Yelp, Facebook, Instagram and (with a Places key) Google — so the
 * owner only has to confirm, not type. Everything is best effort: a page that
 * blocks us simply contributes nothing.
 */

const UA =
  "Mozilla/5.0 (compatible; GodesiSiteBuilder/1.0; +https://godesi.com/website)";
const TIMEOUT_MS = 8000;
const MAX_BYTES = 1_500_000;
const MAX_PHOTOS = 8;

async function fetchPage(url: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { "user-agent": UA, accept: "text/html,*/*" },
      redirect: "follow",
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "";
    if (!type.includes("html") && !type.includes("json")) return null;
    const html = (await res.text()).slice(0, MAX_BYTES);
    return { html, finalUrl: res.url || url };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const decode = (value: string) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function meta(html: string, name: string) {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${name}["'][^>]*content=["']([^"']+)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${name}["']`,
      "i",
    ),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decode(match[1]);
  }
  return undefined;
}

function absolute(src: string, base: string) {
  try {
    return new URL(src, base).toString();
  } catch {
    return null;
  }
}

function isPhoto(url: string) {
  return (
    /^https?:/.test(url) &&
    !/\.(svg|gif)(\?|$)/i.test(url) &&
    !/logo|icon|sprite|pixel|badge|tracking|1x1|blank/i.test(url)
  );
}

type JsonLd = {
  "@type"?: string | string[];
  "@graph"?: JsonLd[];
  name?: string;
  description?: string;
  telephone?: string;
  email?: string;
  image?: string | string[] | { url?: string } | { url?: string }[];
  address?:
    | string
    | {
        streetAddress?: string;
        addressLocality?: string;
        addressRegion?: string;
        postalCode?: string;
      };
  openingHours?: string | string[];
  aggregateRating?: { ratingValue?: number | string; reviewCount?: number | string };
  review?: {
    author?: { name?: string } | string;
    reviewBody?: string;
    reviewRating?: { ratingValue?: number | string };
  }[];
  hasOfferCatalog?: { itemListElement?: { name?: string; itemOffered?: { name?: string } }[] };
  makesOffer?: { itemOffered?: { name?: string } }[];
};

function flattenLd(node: JsonLd): JsonLd[] {
  if (node["@graph"]) return node["@graph"].flatMap(flattenLd);
  return [node];
}

function ldImages(image: JsonLd["image"]): string[] {
  if (!image) return [];
  const list = Array.isArray(image) ? image : [image];
  return list
    .map((item) => (typeof item === "string" ? item : item?.url ?? ""))
    .filter(Boolean);
}

function ldAddress(address: JsonLd["address"]) {
  if (!address) return undefined;
  if (typeof address === "string") return decode(address);
  return [
    address.streetAddress,
    address.addressLocality,
    address.addressRegion,
    address.postalCode,
  ]
    .filter(Boolean)
    .join(", ");
}

/** Pulls the LocalBusiness-style facts out of any JSON-LD on the page. */
function readJsonLd(html: string): Partial<FoundFacts> {
  const facts: Partial<FoundFacts> = {};
  const blocks = Array.from(html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  ));
  for (const block of blocks) {
    let parsed: JsonLd | JsonLd[];
    try {
      parsed = JSON.parse(block[1]) as JsonLd | JsonLd[];
    } catch {
      continue;
    }
    const nodes = (Array.isArray(parsed) ? parsed : [parsed]).flatMap(flattenLd);
    for (const node of nodes) {
      const type = String(
        Array.isArray(node["@type"]) ? node["@type"].join(" ") : node["@type"] ?? "",
      );
      if (/WebSite|BreadcrumbList|WebPage|Organization$/.test(type) && !node.telephone)
        continue;
      facts.name ??= node.name ? decode(node.name) : undefined;
      facts.description ??= node.description ? decode(node.description) : undefined;
      facts.phone ??= node.telephone;
      facts.email ??= node.email;
      facts.address ??= ldAddress(node.address);
      if (node.openingHours) {
        facts.hours ??= (Array.isArray(node.openingHours)
          ? node.openingHours
          : [node.openingHours]
        ).map(decode);
      }
      const rating = Number(node.aggregateRating?.ratingValue);
      if (Number.isFinite(rating) && rating > 0) {
        facts.rating ??= rating;
        const count = Number(node.aggregateRating?.reviewCount);
        if (Number.isFinite(count)) facts.reviewCount ??= count;
      }
      if (node.review?.length) {
        facts.reviews ??= node.review
          .filter((review) => review.reviewBody)
          .slice(0, 6)
          .map((review) => ({
            author:
              typeof review.author === "string"
                ? review.author
                : review.author?.name,
            text: decode(review.reviewBody ?? ""),
            rating: Number(review.reviewRating?.ratingValue) || undefined,
          }));
      }
      const offered = [
        ...(node.hasOfferCatalog?.itemListElement ?? []).map(
          (item) => item.itemOffered?.name ?? item.name,
        ),
        ...(node.makesOffer ?? []).map((item) => item.itemOffered?.name),
      ].filter((name): name is string => Boolean(name));
      if (offered.length) facts.services ??= offered.slice(0, 12);
      const images = ldImages(node.image);
      if (images.length) facts.photos = [...(facts.photos ?? []), ...images];
    }
  }
  return facts;
}

/** Facts from one HTML page: JSON-LD first, then meta tags, then plain links. */
function readPage(html: string, base: string): Partial<FoundFacts> {
  const ld = readJsonLd(html);
  const title = meta(html, "og:title") ?? meta(html, "og:site_name");
  const description = meta(html, "og:description") ?? meta(html, "description");

  const tel = html.match(/href=["']tel:([^"']+)["']/i)?.[1];
  const mail = html.match(/href=["']mailto:([^"'?]+)["']/i)?.[1];

  const photos = new Set<string>();
  const og = meta(html, "og:image");
  if (og) {
    const url = absolute(og, base);
    if (url && isPhoto(url)) photos.add(url);
  }
  for (const image of ld.photos ?? []) {
    const url = absolute(image, base);
    if (url && isPhoto(url)) photos.add(url);
  }
  for (const match of Array.from(html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi))) {
    if (photos.size >= MAX_PHOTOS) break;
    const tag = match[0];
    const width = Number(tag.match(/width=["']?(\d+)/i)?.[1] ?? 0);
    if (width && width < 200) continue;
    const url = absolute(match[1], base);
    if (url && isPhoto(url)) photos.add(url);
  }

  return {
    ...ld,
    name: ld.name ?? title,
    description: ld.description ?? description,
    phone: ld.phone ?? (tel ? decodeURIComponent(tel) : undefined),
    email: ld.email ?? mail,
    photos: Array.from(photos).slice(0, MAX_PHOTOS),
  };
}

async function readUrl(url: string): Promise<Partial<FoundFacts> | null> {
  const page = await fetchPage(url);
  if (!page) return null;
  return readPage(page.html, page.finalUrl);
}

/* ---------- Google ---------- */

export function placesEnabled() {
  return Boolean(process.env.GOOGLE_PLACES_API_KEY);
}

type Place = {
  displayName?: { text?: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  editorialSummary?: { text?: string };
  regularOpeningHours?: { weekdayDescriptions?: string[] };
  photos?: { name: string }[];
  reviews?: {
    rating?: number;
    text?: { text?: string };
    authorAttribution?: { displayName?: string };
  }[];
};

/** Turns a maps link (short or long) into the place name Google shows in the path. */
async function placeNameFromUrl(url: string) {
  let target = url;
  if (/goo\.gl|maps\.app/.test(url)) {
    try {
      const res = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        headers: { "user-agent": UA },
        cache: "no-store",
      });
      target = res.url || url;
    } catch {
      return null;
    }
  }
  const match = target.match(/\/place\/([^/@?]+)/);
  return match ? decodeURIComponent(match[1].replace(/\+/g, " ")) : null;
}

async function googleFacts(
  url: string | undefined,
  fallbackQuery: string,
): Promise<Partial<FoundFacts> | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return null;
  const fromUrl = url ? await placeNameFromUrl(url) : null;
  const query = fromUrl ?? fallbackQuery;
  if (!query.trim()) return null;

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": [
        "places.displayName",
        "places.formattedAddress",
        "places.nationalPhoneNumber",
        "places.internationalPhoneNumber",
        "places.websiteUri",
        "places.rating",
        "places.userRatingCount",
        "places.editorialSummary",
        "places.regularOpeningHours.weekdayDescriptions",
        "places.photos",
        "places.reviews",
      ].join(","),
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: 1 }),
    cache: "no-store",
  }).catch(() => null);
  if (!res?.ok) return null;
  const data = (await res.json()) as { places?: Place[] };
  const place = data.places?.[0];
  if (!place) return null;

  const photos: string[] = [];
  for (const photo of (place.photos ?? []).slice(0, 6)) {
    const media = await fetch(
      `https://places.googleapis.com/v1/${photo.name}/media?maxWidthPx=1200&skipHttpRedirect=true&key=${encodeURIComponent(key)}`,
      { cache: "no-store" },
    ).catch(() => null);
    if (!media?.ok) continue;
    const body = (await media.json()) as { photoUri?: string };
    if (body.photoUri) photos.push(body.photoUri);
  }

  return {
    name: place.displayName?.text,
    description: place.editorialSummary?.text,
    phone: place.internationalPhoneNumber ?? place.nationalPhoneNumber,
    address: place.formattedAddress,
    hours: place.regularOpeningHours?.weekdayDescriptions,
    rating: place.rating,
    reviewCount: place.userRatingCount,
    photos,
    reviews: (place.reviews ?? [])
      .filter((review) => review.text?.text)
      .slice(0, 6)
      .map((review) => ({
        author: review.authorAttribution?.displayName,
        text: review.text?.text ?? "",
        rating: review.rating,
      })),
  };
}

/* ---------- merge ---------- */

function merge(into: FoundFacts, part: Partial<FoundFacts> | null, label: string) {
  if (!part) return;
  const hasSomething =
    part.description || part.phone || part.address || part.photos?.length || part.hours;
  if (!hasSomething) return;
  into.from.push(label);
  into.name ??= part.name;
  into.description ??= part.description;
  into.phone ??= part.phone;
  into.email ??= part.email;
  into.address ??= part.address;
  into.hours ??= part.hours;
  into.rating ??= part.rating;
  into.reviewCount ??= part.reviewCount;
  into.services ??= part.services;
  if (part.reviews?.length) into.reviews = [...(into.reviews ?? []), ...part.reviews].slice(0, 8);
  for (const photo of part.photos ?? []) {
    if (into.photos.length >= MAX_PHOTOS) break;
    if (!into.photos.includes(photo)) into.photos.push(photo);
  }
}

/**
 * Gathers what every pasted link says, Google first (it has the richest
 * structured data), then the business's own site, then Yelp and socials.
 */
export async function gatherFacts({
  sources,
  businessName,
  city,
}: {
  sources: WebsiteSources;
  businessName: string;
  city: string;
}): Promise<FoundFacts> {
  const facts: FoundFacts = { ...EMPTY_FACTS, photos: [], from: [] };

  const [google, site, yelp, facebook, instagram] = await Promise.all([
    sources.google || placesEnabled()
      ? googleFacts(sources.google, `${businessName} ${city}`)
      : null,
    sources.website ? readUrl(sources.website) : null,
    sources.yelp ? readUrl(sources.yelp) : null,
    sources.facebook ? readUrl(sources.facebook) : null,
    sources.instagram ? readUrl(sources.instagram) : null,
  ]);

  merge(facts, google, "Google");
  merge(facts, site, "your website");
  merge(facts, yelp, "Yelp");
  merge(facts, facebook, "Facebook");
  merge(facts, instagram, "Instagram");

  if (facts.description && facts.description.length > 600) {
    facts.description = `${facts.description.slice(0, 597).trimEnd()}…`;
  }
  return facts;
}
