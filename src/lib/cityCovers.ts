import { citySlug } from "@/lib/citySlug";
import { ASTROLOGER_SUBCATEGORIES } from "@/lib/astrology";

/**
 * Stock banners shown on /business profile pages and /city hubs whose listing
 * has no uploaded cover photo — the page gets a finished look instead of a
 * bare header. Keyed by citySlug; images live under
 * /public/images/cities/<slug>.jpg. Cities without a banner fall through to
 * the category banner, so every page still gets a header.
 */
const CITY_COVERS: Record<string, string> = {
  iselin: "/images/cities/iselin.jpg",
  "new-york": "/images/cities/new-york.jpg",
  "san-francisco": "/images/cities/san-francisco.jpg",
  houston: "/images/cities/houston.jpg",
  chicago: "/images/cities/chicago.jpg",
  austin: "/images/cities/austin.jpg",
  dallas: "/images/cities/dallas.jpg",
  "los-angeles": "/images/cities/los-angeles.jpg",
  boston: "/images/cities/boston.jpg",
  atlanta: "/images/cities/atlanta.jpg",
  seattle: "/images/cities/seattle.jpg",
  edison: "/images/cities/edison.jpg",
  "jersey-city": "/images/cities/jersey-city.jpg",
  princeton: "/images/cities/princeton.jpg",
  miami: "/images/cities/miami.jpg",
  "san-jose": "/images/cities/san-jose.jpg",
};

/**
 * A stock banner per top-level category, the second fallback after the city
 * banner: a restaurant page gets food, a jeweller gets jewellery, and so on.
 * Keyed by the business's categorySlug; images live under
 * /public/images/categories/<slug>.jpg. "default" covers categories without
 * their own banner so a header always renders.
 */
const CATEGORY_COVERS: Record<string, string> = {
  "food-catering": "/images/categories/food-catering.jpg",
  "events-wedding": "/images/categories/events-wedding.jpg",
  "it-training": "/images/categories/it-training.jpg",
  "business-services": "/images/categories/business-services.jpg",
  travel: "/images/categories/travel.jpg",
  "community-orgs": "/images/categories/community-orgs.jpg",
  "beauty-lifestyle": "/images/categories/beauty-lifestyle.jpg",
  "religious-services": "/images/categories/religious-services.jpg",
  "financial-services": "/images/categories/financial-services.jpg",
  "shops-retail": "/images/categories/shops-retail.jpg",
  "auto-services": "/images/categories/auto-services.jpg",
  "care-services": "/images/categories/care-services.jpg",
  construction: "/images/categories/construction.jpg",
  education: "/images/categories/education.jpg",
  "home-services": "/images/categories/home-services.jpg",
  jobs: "/images/categories/jobs.jpg",
  professionals: "/images/categories/professionals.jpg",
  "rooms-roommates": "/images/categories/rooms-roommates.jpg",
  "buy-sell": "/images/categories/buy-sell.jpg",
  "shops-retail-jewellery-stores":
    "/images/categories/shops-retail-jewellery-stores.jpg",
  "real-estate": "/images/categories/real-estate.jpg",
  "health-medical": "/images/categories/health-medical.jpg",
};

const DEFAULT_COVER = "/images/categories/default.jpg";

/** Gurdwaras get a Gurdwara banner, not the generic temple art of their category. */
export const SIKH_COVER = "/images/categories/sikh-gurdwara.jpg";

/** Astrologers get zodiac art instead of a city skyline or the temple banner. */
export const ASTROLOGY_COVER = "/images/categories/astrologers.jpg";

const ASTROLOGY_NAME = /\b(astrolog\w*|jyotish\w*|horoscopes?|kundli)\b/i;

/** Astrologer listings: filed under an astrologer subcategory, or an astrologer-named religious/professional card. */
export function isAstrologer(business: {
  name?: string | null;
  categorySlug?: string | null;
  subcategorySlug?: string | null;
}): boolean {
  const slugs = [business.subcategorySlug, business.categorySlug];
  if (slugs.some((slug) => slug && ASTROLOGER_SUBCATEGORIES.includes(slug))) return true;
  const slug = business.categorySlug ?? "";
  return (
    (slug.startsWith("religious-services") || slug.startsWith("professionals")) &&
    ASTROLOGY_NAME.test(business.name ?? "")
  );
}

const SIKH_NAME = /\b(gurdwara|gurudwara|gurudwar|sikhs?|singh sabha|khalsa)\b/i;
const GURDWARA_NAME = /\b(gurdwara|gurudwara|gurudwar|sangat|sabha|sikh temple)\b/i;

/** Sikh worship listings: any Sikh name under religious services, or a Gurdwara-named community org. */
export function isSikhPlace(business: {
  name?: string | null;
  categorySlug?: string | null;
}): boolean {
  const name = business.name ?? "";
  const slug = business.categorySlug ?? "";
  if (slug.startsWith("religious-services")) return SIKH_NAME.test(name);
  if (slug.startsWith("community-orgs"))
    return SIKH_NAME.test(name) && GURDWARA_NAME.test(name);
  return false;
}

/** Category art for a listing card, with the Gurdwara banner for Sikh places and zodiac art for astrologers. */
export function listingCategoryCover(business: {
  name?: string | null;
  categorySlug?: string | null;
  subcategorySlug?: string | null;
}): string | null {
  if (isSikhPlace(business)) return SIKH_COVER;
  if (isAstrologer(business)) return ASTROLOGY_COVER;
  return categoryCover(business.categorySlug);
}

/** Bazaar-street banner shown on /city hubs that have no dedicated photo. */
export const CITY_DEFAULT_COVER = DEFAULT_COVER;

export function cityCover(city: string | null | undefined): string | null {
  if (!city) return null;
  return CITY_COVERS[citySlug(city)] ?? null;
}

export function categoryCover(
  categorySlug: string | null | undefined,
): string | null {
  if (!categorySlug) return null;
  /** Child slugs ("buy-sell-furniture") fall back to their parent's art. */
  let slug = categorySlug;
  while (slug) {
    const cover = CATEGORY_COVERS[slug];
    if (cover) return cover;
    const cut = slug.lastIndexOf("-");
    if (cut < 0) return null;
    slug = slug.slice(0, cut);
  }
  return null;
}

/**
 * The header image for a listing page: the owner's uploaded cover wins, then
 * their city's banner, then their category's, then a generic bazaar banner —
 * so every /business page always has a finished-looking header. A Gurdwara
 * without its own photo shows the Gurdwara banner ahead of the city one, and
 * an astrologer shows zodiac art.
 */
export function listingCover(business: {
  name?: string | null;
  coverUrl?: string | null;
  city?: string | null;
  categorySlug?: string | null;
  subcategorySlug?: string | null;
}): string {
  return (
    business.coverUrl ??
    (isSikhPlace(business) ? SIKH_COVER : null) ??
    (isAstrologer(business) ? ASTROLOGY_COVER : null) ??
    cityCover(business.city) ??
    categoryCover(business.categorySlug) ??
    DEFAULT_COVER
  );
}
