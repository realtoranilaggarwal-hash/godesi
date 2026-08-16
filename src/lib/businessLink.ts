/**
 * Reads a business page someone pasted — a Sulekha provider page, a temple's
 * own site, a company's about page — and pulls out the facts a directory card
 * needs: who they are, what they do, where, and how to reach them.
 *
 * Facts only. The description is left for the desk to write in its own words,
 * and a photo is never taken from someone else's page.
 */

import { address, findLd, meta, readPage, text } from "@/lib/pageRead";

export type BusinessDraft = {
  sourceUrl: string;
  host: string;
  name: string;
  /** What the source says about them, shown to the desk to rewrite, not saved. */
  about: string;
  phone: string;
  websiteUrl: string;
  address: string;
  city: string;
  state: string;
  /** Our own category slug, guessed from the page; the desk confirms it. */
  categorySlug: string;
  /** An individual (priest, realtor, tutor) rather than a company. */
  professional: boolean;
  missing: string[];
};

/**
 * Words a listing page uses for its trade, mapped to our top categories. The
 * first match wins, so the more specific words come first.
 */
const CATEGORY_WORDS: [RegExp, string][] = [
  [/priest|pandit|pooja|puja|astrolog|temple|religio|vedic|jyoti/i, "religious-services"],
  [/caterer|catering|tiffin|cook|restaurant|bakery|sweets|food/i, "food-catering"],
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

function guessCategory(...hints: string[]) {
  const haystack = hints.join(" ").replace(/[-_/]+/g, " ");
  for (const [words, slug] of CATEGORY_WORDS) {
    if (words.test(haystack)) return slug;
  }
  return "";
}

/** Sulekha-style paths read like /belleville-nj/religious-service/om-temple-123. */
function tradeFromPath(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 2] : (parts[0] ?? "");
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

export async function readBusinessLink(link: string): Promise<BusinessDraft> {
  const { target, page } = await readPage(link);

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

  const draft: BusinessDraft = {
    sourceUrl: target.toString(),
    host: target.hostname.replace(/^www\./, ""),
    name,
    about,
    phone: phoneOf(ld?.telephone),
    // Their own site if the page names one, never the page we read.
    websiteUrl: (() => {
      const url = text(ld?.url);
      return url && !url.includes(target.hostname) ? url : "";
    })(),
    address: where.street || where.address,
    city: where.city || fromPath.city,
    state: where.state || fromPath.state,
    categorySlug: guessCategory(trade, title, name, about.slice(0, 200)),
    professional: PROFESSIONAL_WORDS.test(`${trade} ${title} ${name}`),
    missing: [],
  };

  if (!draft.name) draft.missing.push("name");
  if (!draft.city) draft.missing.push("city");
  if (!draft.categorySlug) draft.missing.push("category");
  return draft;
}
