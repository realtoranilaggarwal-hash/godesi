/**
 * Reads a business page someone pasted — a directory profile, a temple's
 * own site, a company's about page — and pulls out the facts a directory card
 * needs: who they are, what they do, where, and how to reach them.
 *
 * Facts only. The description is left for the desk to write in its own words,
 * and a photo is never taken from someone else's page.
 */

import { CATEGORY_TREE, subcategorySlug } from "@/lib/categories";
import { address, findLd, meta, plainText, readPage, text } from "@/lib/pageRead";
import { specialtySet } from "@/lib/specialties";

export type BusinessDraft = {
  sourceUrl: string;
  host: string;
  name: string;
  /** What the source says about them, shown to the desk to rewrite, not saved. */
  about: string;
  phone: string;
  /** The enquiry address the page publishes, if it prints one. */
  email: string;
  websiteUrl: string;
  address: string;
  city: string;
  state: string;
  /** Our own category slug, guessed from the page; the desk confirms it. */
  categorySlug: string;
  /** The trade inside that category, e.g. Mehndi Artists. */
  subcategorySlug: string;
  /** Services from our own list that the page's words match — pre-ticked. */
  specialties: string[];
  /** Languages the page says they work in. */
  languages: string[];
  /** Towns the page says they serve, beyond their own. */
  areas: string[];
  /** Years in business, as a number the page states. */
  years: string;
  /** Opening hours in the page's own words, e.g. "Open 24hrs". */
  hours: string;
  /** A description built from the facts above, in our wording, for the desk to edit. */
  suggestion: string;
  /** An individual (priest, realtor, tutor) rather than a company. */
  professional: boolean;
  missing: string[];
};

/**
 * Words a listing page uses for its trade, mapped to our top categories. The
 * first match wins, so the more specific words come first.
 */
const CATEGORY_WORDS: [RegExp, string][] = [
  [
    /priest|pandit|pooja|puja|astrolog|temple|religio|vedic|jyoti|mandir|gurud?wara|masjid|mosque|church|place.of.worship/i,
    "religious-services",
  ],
  [/caterer|catering|tiffin|cook|restaurant|bakery|sweets|food|cafe|cuisine/i, "food-catering"],
  [/wedding|mehndi|mehendi|decorator|dj |photograph|videograph|makeup artist|event/i, "events-wedding"],
  [/software|it (service|compan|consult|staff)|technolog|web develop|app develop|it-/i, "it-training"],
  [/tutor|tuition|coaching|class(es)?|school|academy|learning|abacus|music teacher/i, "education"],
  [/realtor|real estate|mortgage|loan|realty|property/i, "real-estate"],
  [/room|roommate|pg |hostel/i, "rooms-roommates"],
  [/salon|spa|beautician|beauty|threading|hair/i, "beauty-lifestyle"],
  [/travel|tour|taxi|cab|limo|movers|packers|shipping|courier/i, "travel"],
  [/doctor|dentist|clinic|physician|therapy|yoga|ayurved|health|medical/i, "health-medical"],
  [/attorney|lawyer|immigration|accountant|cpa|tax|insurance|financ/i, "financial-services"],
  [/plumb|electric|hvac|cleaning|handyman|painter|landscap|pest|home /i, "home-services"],
  [/auto|car repair|mechanic|driving school|tyre|tire/i, "auto-services"],
  [/construct|contractor|remodel|roofing|flooring/i, "construction"],
  [/grocery|store|shop|retail|boutique|jewell|jewel|saree/i, "shops-retail"],
  [/non ?profit|association|samaj|sangh|community|charit/i, "community-orgs"],
  [/consult|staffing|recruit|marketing|design|business/i, "business-services"],
];

const PROFESSIONAL_WORDS =
  /priest|pandit|astrolog|realtor|agent|attorney|lawyer|tutor|teacher|consultant|photograph|artist|therapist|doctor|dentist|cpa|accountant|advisor/i;

/** Our top category for any words that name a trade, e.g. a directory heading. */
export function guessCategory(...hints: string[]) {
  const haystack = hints.join(" ").replace(/[-_/]+/g, " ");
  for (const [words, slug] of CATEGORY_WORDS) {
    if (words.test(haystack)) return slug;
  }
  return "";
}

/** What to call the trade in a sentence: the specific one if we know it. */
function tradeName(categorySlug: string, subcategory: string) {
  const parent = CATEGORY_TREE.find((entry) => entry.slug === categorySlug);
  if (!parent) return "";
  const child = parent.children.find(
    (name) => subcategorySlug(categorySlug, name) === subcategory,
  );
  // "Mehndi Artists" reads better in a sentence as the singular trade.
  return (child ?? parent.name).replace(/s$/, "");
}

/** Lower case, punctuation flattened, so "Bridal Mehndi" meets "bridal-mehndi". */
function loose(value: string) {
  return ` ${value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()} `;
}

/** Words that carry no trade meaning, so they can't decide a match on their own. */
const NOISE = new Set([
  "and",
  "the",
  "for",
  "with",
  "your",
  "our",
  "service",
  "services",
  "other",
  "own",
  "full",
  "add",
  "on",
  "at",
  "in",
  "of",
  "to",
  "day",
  "same",
  "from",
  "by",
  // Says nothing about a trade: every provider page prints "years in business".
  "business",
]);

/** The meaningful words of an option, e.g. "Bridal mehndi (full hands)" → bridal, mehndi, hands. */
function keyWords(option: string) {
  return loose(option)
    .split(" ")
    .filter((word) => word.length > 2 && !NOISE.has(word));
}

/**
 * The trade inside a category, chosen by how much of a child's name the page
 * actually says. "Bridal Mehndi Artists in Edison" picks Mehndi Artists over
 * Makeup Artists because two of its words appear, not one.
 */
function guessSubcategory(categorySlug: string, haystack: string) {
  const parent = CATEGORY_TREE.find((entry) => entry.slug === categorySlug);
  if (!parent) return "";

  const hay = loose(haystack);
  let best = { name: "", score: 0 };
  for (const child of parent.children) {
    const words = keyWords(child);
    if (!words.length) continue;
    const hits = words.filter((word) => hay.includes(` ${word} `)).length;
    // Every word of a two-word trade, or most of a longer one.
    if (hits === words.length || hits >= 2) {
      const score = hits + words.length / 100;
      if (score > best.score) best = { name: child, score };
    }
  }
  return best.name ? subcategorySlug(categorySlug, best.name) : "";
}

/**
 * Ticks the services on our own list that the page's words support. Only our
 * option names are ever stored — their sentences stay theirs.
 */
function guessSpecialties(subcategory: string, haystack: string) {
  const set = specialtySet(subcategory);
  if (!set) return [];

  const hay = loose(haystack);
  return set.options
    .filter((option) => {
      const words = keyWords(option);
      if (!words.length) return false;
      const hits = words.filter((word) => hay.includes(` ${word} `)).length;
      if (words.length === 1) return hits === 1;
      // Most of a longer name must be there, so "Jupiter transit prediction"
      // is not ticked because the page mentions a Saturn transit.
      return hits >= Math.max(2, Math.ceil(words.length * 0.6));
    })
    .slice(0, 30);
}

const LANGUAGES = [
  "English",
  "Hindi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Gujarati",
  "Marathi",
  "Punjabi",
  "Bengali",
  "Odia",
  "Assamese",
  "Konkani",
  "Tulu",
  "Sanskrit",
  "Urdu",
  "Nepali",
  "Sinhala",
  "Spanish",
];

/** Languages a provider page lists, e.g. "Language: English , Hindi". */
function guessLanguages(page: string, haystack: string) {
  const stated = /languages?\s*[:\-]([^<\n]{0,160})/i.exec(plainText(page.slice(0, 400_000)));
  const scope = stated ? loose(stated[1]) : loose(haystack);
  return LANGUAGES.filter((language) => scope.includes(loose(language).trim()));
}

/** "30 Years in Business", "since 1998" — whichever the page states. */
function guessYears(haystack: string) {
  const stated = /(\d{1,2})\s*\+?\s*years?\s+(?:in\s+business|of\s+experience|experience)/i.exec(
    haystack,
  );
  if (stated) return stated[1];

  const since = /(?:since|established|est\.?)\s*(19\d{2}|20[0-2]\d)/i.exec(haystack);
  if (since) {
    const years = new Date().getFullYear() - Number(since[1]);
    if (years > 0 && years < 120) return String(years);
  }
  return "";
}

/** Towns a page says it serves: "Areas Served … Allen, TX · Sugar Land, TX". */
function guessAreas(page: string) {
  const readable = plainText(page.slice(0, 400_000));
  const block = /areas?\s+served[^\n]*\n([\s\S]{0,1200})/i.exec(readable);
  if (!block) return [];

  const towns = block[1].match(/\b[A-Z][A-Za-z.'-]+(?: [A-Z][A-Za-z.'-]+)*,\s*[A-Z]{2}\b/g);
  return Array.from(new Set(towns ?? [])).slice(0, 24);
}

/** Hours as the page publishes them, either from JSON-LD or its own badge. */
function guessHours(ld: Record<string, unknown> | null, haystack: string) {
  const stated = ld?.openingHours;
  if (typeof stated === "string") return plainText(stated).slice(0, 120);
  if (Array.isArray(stated)) {
    return stated.filter((item) => typeof item === "string").join(", ").slice(0, 120);
  }
  if (/open\s*24\s*(hrs|hours)/i.test(haystack)) return "Open 24 hours";
  return "";
}

/**
 * A description assembled from the facts, in our own sentence shape — never
 * their prose. The desk edits it before saving, and can empty it.
 */
function suggestDescription({
  name,
  trade,
  city,
  state,
  specialties,
  languages,
  years,
  areas,
}: {
  name: string;
  trade: string;
  city: string;
  state: string;
  specialties: string[];
  languages: string[];
  years: string;
  areas: string[];
}) {
  if (!name || !trade) return "";

  const where = [city, state].filter(Boolean).join(", ");
  const article = /^[aeiou]/i.test(trade) ? "is an" : "is a";
  const opener = [
    name,
    article,
    years ? `${trade.toLowerCase()} with ${years} years' experience` : trade.toLowerCase(),
    where ? `in ${where}` : "",
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ");

  const sentences = [`${opener}.`];
  if (specialties.length) {
    sentences.push(`Services include ${specialties.slice(0, 6).join(", ")}.`);
  }
  if (languages.length) {
    sentences.push(`Speaks ${languages.slice(0, 4).join(", ")}.`);
  }
  // Their own town is already in the first line, so only the others are news.
  const elsewhere = areas.filter(
    (area) => !city || !area.toLowerCase().startsWith(city.toLowerCase()),
  );
  if (elsewhere.length) {
    sentences.push(`Also serves ${elsewhere.slice(0, 5).join(", ")}.`);
  }
  return sentences.join(" ");
}

/**
 * Directory paths read like /belleville-nj/religious-service/om-temple-123,
 * and their trade pages like /edison-nj/pandit-hindu-priest-services, so the
 * trade is in either of the last two segments.
 */
function tradeFromPath(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  return parts.slice(-2).join(" ");
}

/** Listing sites put the town in the path, e.g. /cliffside-park-nj/… */
function placeFromPath(pathname: string) {
  const first = pathname.split("/").filter(Boolean)[0] ?? "";
  const match = /^([a-z-]+)-([a-z]{2})$/.exec(first);
  if (!match) return { city: "", state: "" };
  return {
    city: match[1]
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
    state: match[2].toUpperCase(),
  };
}

/** A phone as the page publishes it, digits and separators only. */
function phoneOf(value: unknown) {
  const raw = text(value);
  const digits = raw.replace(/[^\d]/g, "");
  return digits.length >= 10 ? raw.slice(0, 30) : "";
}

/**
 * The enquiry address the page publishes. An address on the business's own
 * domain comes first, since sites often also carry their web designer's.
 */
function emailOnPage(page: string, host: string) {
  const found = page.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) ?? [];
  const usable = found
    .map((value) => value.toLowerCase())
    .filter(
      (value) =>
        !/\.(png|jpe?g|gif|webp|svg|css|js)$/.test(value) &&
        !/(example|sentry|wixpress|godaddy|wordpress|squarespace|no-?reply)/.test(value),
    );
  const domain = host.replace(/^www\./, "");
  return (
    usable.find((value) => value.endsWith(`@${domain}`)) ??
    usable.find((value) =>
      /^(info|contact|sales|hello|admin|office|enquir)/.test(value),
    ) ??
    usable[0] ??
    ""
  ).slice(0, 120);
}

/** The first published number on the page, when there is no JSON-LD to read. */
function phoneOnPage(readable: string) {
  const match =
    /(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.exec(readable) ?? null;
  return match ? match[0].trim().slice(0, 30) : "";
}

/** A Google Maps / Google Business Profile link, including the share shortener. */
function isGoogleMaps(host: string) {
  return /(^|\.)google\.[a-z.]+$/.test(host) || host === "goo.gl" || host === "maps.app.goo.gl";
}

/**
 * Google Maps serves its place data inside the page rather than as JSON-LD, so
 * the facts are read from the place URL and the page title:
 * /maps/place/Name/@lat,lng… plus the address line Google prints itself.
 *
 * This is the free route — no API key, and no key needed. It reads only what
 * Google publishes on the page, and where Google returns a stripped page the
 * desk fills the gaps by hand from its own screen.
 */
function fromGoogleMaps(target: URL, page: string) {
  const readable = plainText(page.replace(/></g, "> ")).slice(0, 40_000);
  const slug = /\/maps\/place\/([^/@]+)/.exec(target.pathname)?.[1] ?? "";
  const fromSlug = decodeURIComponent(slug.replace(/\+/g, " ")).trim();
  const title = meta(page, "og:title") || meta(page, "title");
  const name = fromSlug || title.split(/[-|·]/)[0].trim();

  // Google's own description line reads "Name · Address · Phone · Category".
  const summary = meta(page, "og:description") || meta(page, "description");
  const parts = summary
    .split("·")
    .map((part) => part.trim())
    .filter(Boolean);
  const line =
    parts.find((part) => /\d.*,\s*[A-Z]{2}\s*\d{5}/.test(part)) ??
    parts.find((part) => /,\s*[A-Z]{2}\b/.test(part)) ??
    "";
  const place = /^(.*?),\s*([^,]+),\s*([A-Z]{2})\b/.exec(line);

  return {
    name,
    about: summary.slice(0, 2000),
    address: place?.[1]?.trim() ?? line,
    city: place?.[2]?.trim() ?? "",
    state: place?.[3] ?? "",
    phone: phoneOnPage(`${summary} ${readable.slice(0, 4000)}`),
    // Google lists the trade in its own words, e.g. "Indian restaurant".
    trade: parts.find((part) => /[a-z]/.test(part) && !/\d/.test(part)) ?? "",
    readable,
  };
}

/**
 * Google serves a robot a shell page with no place facts on it, so the free
 * route reads the shop's own record in OpenStreetMap instead: the Google link
 * gives us the name and the exact spot on the map, and OSM gives the street,
 * town, phone, website and opening hours for that spot. No API key, no card.
 * Data © OpenStreetMap contributors, ODbL.
 */
type OsmPlace = {
  street: string;
  city: string;
  state: string;
  phone: string;
  websiteUrl: string;
  hours: string;
  trade: string;
};

async function osmPlace(name: string, lat: number, lng: number): Promise<OsmPlace | null> {
  const query = `[out:json][timeout:20];nwr[name](around:220,${lat},${lng});out tags 40;`;
  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "GodesiPageReader/1.0 (+https://godesi.com)",
    },
    body: `data=${encodeURIComponent(query)}`,
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) return null;

  const body = (await response.json()) as {
    elements?: { tags?: Record<string, string> }[];
  };
  const wanted = loose(name);
  const hit =
    body.elements?.find((element) => {
      const tag = loose(element.tags?.name ?? "");
      return tag === wanted || tag.includes(wanted.trim()) || wanted.includes(tag.trim());
    }) ?? null;
  const tags = hit?.tags;
  if (!tags) return null;

  const house = [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ");
  return {
    street: house,
    city: tags["addr:city"] ?? "",
    state: (tags["addr:state"] ?? "").toUpperCase(),
    phone: tags["phone"] ?? tags["contact:phone"] ?? "",
    websiteUrl: tags["website"] ?? tags["contact:website"] ?? "",
    hours: (tags["opening_hours"] ?? "").slice(0, 120),
    // OSM says what a place is in its own vocabulary: cuisine=indian, shop=jewelry.
    trade: [tags["amenity"], tags["shop"], tags["office"], tags["cuisine"], tags["craft"]]
      .filter(Boolean)
      .join(" ")
      .replace(/[_;]+/g, " "),
  };
}

/** Turns what Google's page publishes into the same draft the desk confirms. */
async function googleDraft(target: URL, page: string): Promise<BusinessDraft> {
  const google = fromGoogleMaps(target, page);
  const at = /@(-?\d+\.\d+),(-?\d+\.\d+)/.exec(target.toString());
  const osm =
    at && google.name
      ? await osmPlace(google.name, Number(at[1]), Number(at[2])).catch(() => null)
      : null;
  const trade = [google.trade, osm?.trade].filter(Boolean).join(" ");
  const haystack = `${trade} ${google.name} ${google.about} ${google.readable}`;
  const categorySlug = guessCategory(trade, google.name, google.about);
  const subcategory = categorySlug
    ? guessSubcategory(categorySlug, `${trade} ${google.name}`) ||
      guessSubcategory(categorySlug, haystack.slice(0, 6000))
    : "";
  const specialties = guessSpecialties(subcategory, haystack);
  const languages = guessLanguages(page, `${google.name} ${google.about}`);
  const city = google.city || osm?.city || "";
  const state = google.state || osm?.state || "";

  const draft: BusinessDraft = {
    sourceUrl: target.toString(),
    host: "google.com",
    name: google.name,
    about: google.about,
    phone: google.phone || osm?.phone || "",
    email: "",
    websiteUrl: osm?.websiteUrl ?? "",
    address: google.address || osm?.street || "",
    city,
    state,
    categorySlug,
    subcategorySlug: subcategory,
    specialties,
    languages,
    areas: [],
    years: guessYears(haystack.slice(0, 6000)),
    hours: osm?.hours || guessHours(null, haystack.slice(0, 6000)),
    suggestion: suggestDescription({
      name: google.name,
      trade: tradeName(categorySlug, subcategory),
      city,
      state,
      specialties,
      languages,
      years: "",
      areas: [],
    }),
    professional: PROFESSIONAL_WORDS.test(`${trade} ${google.name}`),
    missing: [],
  };

  if (!draft.name) draft.missing.push("name");
  if (!draft.city) draft.missing.push("city");
  if (!draft.categorySlug) draft.missing.push("category");
  return draft;
}

export async function readBusinessLink(link: string): Promise<BusinessDraft> {
  const { target, page } = await readPage(link);
  if (isGoogleMaps(target.hostname.replace(/^www\./, ""))) {
    return await googleDraft(target, page);
  }

  const ld = findLd(page, /(Business|Organization|Store|Restaurant|Professional|Place)$/i);
  const where = address(ld ?? {});
  const trade = tradeFromPath(target.pathname);
  const fromPath = placeFromPath(target.pathname);
  const title = meta(page, "og:title");
  const name = text(ld?.name) || title.split(/[-|–]/)[0].trim();
  const about = (
    text(ld?.description) ||
    meta(page, "og:description") ||
    meta(page, "description")
  ).slice(0, 2000);

  // The visible words of the page, used only to match our own lists: their
  // service headings tell us which tick-boxes to offer, nothing is copied.
  // Tags become spaces first: a list of services must not run together into
  // one unreadable word when the markup is stripped.
  const readable = plainText(page.slice(0, 400_000).replace(/></g, "> <")).slice(
    0,
    40_000,
  );
  const haystack = `${trade} ${title} ${name} ${about} ${readable}`;

  const categorySlug = guessCategory(trade, title, name, about.slice(0, 200));
  const subcategory = categorySlug
    ? guessSubcategory(categorySlug, `${trade} ${title} ${name} ${about}`) ||
      guessSubcategory(categorySlug, haystack.slice(0, 6000))
    : "";
  const specialties = guessSpecialties(subcategory, haystack);
  const languages = guessLanguages(page, `${title} ${about}`);
  const years = guessYears(haystack.slice(0, 6000));
  const areas = guessAreas(page);
  const city = where.city || fromPath.city;
  const state = where.state || fromPath.state;

  const draft: BusinessDraft = {
    sourceUrl: target.toString(),
    host: target.hostname.replace(/^www\./, ""),
    name,
    about,
    phone: phoneOf(ld?.telephone) || phoneOnPage(readable.slice(0, 4000)),
    email: text(ld?.email).replace(/^mailto:/i, "") || emailOnPage(page, target.hostname),
    // Their own site if the page names one, never the page we read.
    websiteUrl: (() => {
      const url = text(ld?.url);
      return url && !url.includes(target.hostname) ? url : "";
    })(),
    address: where.street || where.address,
    city,
    state,
    categorySlug,
    subcategorySlug: subcategory,
    specialties,
    languages,
    areas,
    years,
    hours: guessHours(ld, haystack.slice(0, 6000)),
    suggestion: suggestDescription({
      name,
      trade: tradeName(categorySlug, subcategory),
      city,
      state,
      specialties,
      languages,
      years,
      areas,
    }),
    professional: PROFESSIONAL_WORDS.test(`${trade} ${title} ${name}`),
    missing: [],
  };

  if (!draft.name) draft.missing.push("name");
  if (!draft.city) draft.missing.push("city");
  if (!draft.categorySlug) draft.missing.push("category");
  return draft;
}
