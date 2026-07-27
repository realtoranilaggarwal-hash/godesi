import { db } from "../src/lib/db";
import { slugify } from "../src/lib/slug";
import { subcategorySlug } from "../src/lib/categories";

/**
 * Seeds unclaimed starter listings from OpenStreetMap via Overpass, so category
 * pages are populated with real places people can claim.
 *
 *   npm run db:businesses                # 10 per category across US cities
 *   npm run db:businesses -- 15          # or another per-category cap
 *
 * Rows are keyed by `osmId` (re-runnable), created with no owner so the public
 * "Claim this business" panel applies, and attributed to OpenStreetMap (ODbL).
 * Only name/address/phone/website tags are used — nothing is copied from any
 * commercial directory.
 */

type OverpassElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

const CITIES: { name: string; state: string; area: [number, number, number, number] }[] = [
  // [south, west, north, east]
  { name: "Edison", state: "NJ", area: [40.49, -74.44, 40.6, -74.31] },
  { name: "Jersey City", state: "NJ", area: [40.66, -74.12, 40.78, -74.02] },
  { name: "New York", state: "NY", area: [40.68, -74.02, 40.82, -73.9] },
  { name: "Fremont", state: "CA", area: [37.46, -122.05, 37.6, -121.88] },
  { name: "San Jose", state: "CA", area: [37.2, -122.05, 37.45, -121.75] },
  { name: "Dallas", state: "TX", area: [32.65, -96.95, 32.95, -96.65] },
  { name: "Houston", state: "TX", area: [29.6, -95.6, 29.95, -95.2] },
  { name: "Chicago", state: "IL", area: [41.7, -87.9, 42.02, -87.52] },
  { name: "Atlanta", state: "GA", area: [33.65, -84.55, 33.89, -84.29] },
  { name: "Seattle", state: "WA", area: [47.5, -122.44, 47.73, -122.24] },
];

type ProfileKind = "BUSINESS" | "PROFESSIONAL";

/**
 * OSM tag -> Godesi taxonomy. `desiOnly` keeps food/grocery relevant to the
 * community instead of importing every diner in a metro.
 */
type Target = {
  selector: string;
  categorySlug: string;
  subcategory: string;
  profileType: ProfileKind;
  desiOnly?: boolean;
};

const TARGETS: Target[] = [
  // Food & catering
  { selector: '["amenity"="restaurant"]', categorySlug: "food-catering", subcategory: "Restaurants", profileType: "BUSINESS", desiOnly: true },
  { selector: '["shop"="bakery"]', categorySlug: "food-catering", subcategory: "Bakers & Cakes", profileType: "BUSINESS" },
  { selector: '["shop"="confectionery"]', categorySlug: "food-catering", subcategory: "Sweet Shops", profileType: "BUSINESS" },
  { selector: '["craft"="caterer"]', categorySlug: "food-catering", subcategory: "Caterers", profileType: "BUSINESS" },
  // Beauty & lifestyle
  { selector: '["shop"="hairdresser"]', categorySlug: "beauty-lifestyle", subcategory: "Salons & Parlours", profileType: "BUSINESS" },
  { selector: '["shop"="beauty"]', categorySlug: "beauty-lifestyle", subcategory: "Spa & Massage", profileType: "BUSINESS" },
  { selector: '["leisure"="fitness_centre"]', categorySlug: "beauty-lifestyle", subcategory: "Gyms & Fitness", profileType: "BUSINESS" },
  { selector: '["shop"="tailor"]', categorySlug: "beauty-lifestyle", subcategory: "Boutiques & Tailors", profileType: "BUSINESS" },
  // Home services
  { selector: '["craft"="plumber"]', categorySlug: "home-services", subcategory: "Plumbers", profileType: "BUSINESS" },
  { selector: '["craft"="electrician"]', categorySlug: "home-services", subcategory: "Electricians", profileType: "BUSINESS" },
  { selector: '["craft"="carpenter"]', categorySlug: "home-services", subcategory: "Carpenters", profileType: "BUSINESS" },
  { selector: '["craft"="painter"]', categorySlug: "home-services", subcategory: "Painters", profileType: "BUSINESS" },
  { selector: '["shop"="interior_decoration"]', categorySlug: "home-services", subcategory: "Interior Designers", profileType: "BUSINESS" },
  // Education & training
  { selector: '["amenity"="language_school"]', categorySlug: "education", subcategory: "Language Classes", profileType: "BUSINESS" },
  { selector: '["amenity"="music_school"]', categorySlug: "education", subcategory: "Music Classes", profileType: "BUSINESS" },
  { selector: '["amenity"="childcare"]', categorySlug: "education", subcategory: "Playschools & Daycare", profileType: "BUSINESS" },
  { selector: '["office"="educational_institution"]', categorySlug: "education", subcategory: "Coaching Centres", profileType: "BUSINESS" },
  // Business & IT services
  { selector: '["office"="accountant"]', categorySlug: "business-services", subcategory: "Chartered Accountants", profileType: "BUSINESS" },
  { selector: '["office"="lawyer"]', categorySlug: "business-services", subcategory: "Lawyers & Legal", profileType: "BUSINESS" },
  { selector: '["shop"="copyshop"]', categorySlug: "business-services", subcategory: "Printing & Signage", profileType: "BUSINESS" },
  { selector: '["office"="it"]', categorySlug: "business-services", subcategory: "Web & App Development", profileType: "BUSINESS" },
  { selector: '["office"="advertising_agency"]', categorySlug: "business-services", subcategory: "Digital Marketing", profileType: "BUSINESS" },
  // Real estate
  { selector: '["office"="estate_agent"]', categorySlug: "real-estate", subcategory: "Real Estate Agents", profileType: "BUSINESS" },
  { selector: '["office"="property_management"]', categorySlug: "real-estate", subcategory: "Property Management", profileType: "BUSINESS" },
  // Professionals & experts
  { selector: '["office"="financial_advisor"]', categorySlug: "professionals", subcategory: "Financial Advisors", profileType: "PROFESSIONAL" },
  { selector: '["office"="tax_advisor"]', categorySlug: "professionals", subcategory: "Accountants", profileType: "PROFESSIONAL" },
  { selector: '["office"="insurance"]', categorySlug: "professionals", subcategory: "Insurance Agents", profileType: "PROFESSIONAL" },
  { selector: '["amenity"="doctors"]', categorySlug: "professionals", subcategory: "Doctors & Therapists", profileType: "PROFESSIONAL" },
  // Wedding & event services
  { selector: '["craft"="photographer"]', categorySlug: "events-wedding", subcategory: "Photographers", profileType: "BUSINESS" },
  { selector: '["shop"="photo"]', categorySlug: "events-wedding", subcategory: "Photographers", profileType: "BUSINESS" },
  { selector: '["shop"="jewelry"]', categorySlug: "events-wedding", subcategory: "Jewellery", profileType: "BUSINESS" },
  { selector: '["shop"="florist"]', categorySlug: "events-wedding", subcategory: "Decorators & Florists", profileType: "BUSINESS" },
  { selector: '["amenity"="events_venue"]', categorySlug: "events-wedding", subcategory: "Banquet Halls & Venues", profileType: "BUSINESS" },
  { selector: '["shop"="wedding"]', categorySlug: "events-wedding", subcategory: "Bridal Wear", profileType: "BUSINESS" },
  // Travel & transport
  { selector: '["shop"="travel_agency"]', categorySlug: "travel", subcategory: "Travel Agents", profileType: "BUSINESS" },
  { selector: '["tourism"="hotel"]', categorySlug: "travel", subcategory: "Hotels & Resorts", profileType: "BUSINESS" },
  { selector: '["shop"="car_rental"]', categorySlug: "travel", subcategory: "Car Rentals", profileType: "BUSINESS" },
  // Religious & cultural
  { selector: '["shop"="religion"]', categorySlug: "religious-services", subcategory: "Pooja Samagri", profileType: "BUSINESS" },
  // Jobs & freelancers
  { selector: '["office"="employment_agency"]', categorySlug: "jobs", subcategory: "Placement Consultants", profileType: "BUSINESS" },
  // Buy & sell
  { selector: '["shop"="furniture"]', categorySlug: "buy-sell", subcategory: "Furniture", profileType: "BUSINESS" },
  { selector: '["shop"="mobile_phone"]', categorySlug: "buy-sell", subcategory: "Mobiles & Electronics", profileType: "BUSINESS" },
  { selector: '["shop"="books"]', categorySlug: "buy-sell", subcategory: "Books & Stationery", profileType: "BUSINESS" },
  { selector: '["shop"="clothes"]', categorySlug: "buy-sell", subcategory: "Clothing & Accessories", profileType: "BUSINESS" },
];

const DESI_HINT =
  /(indian|india|pakistan|bangladesh|nepal|sri.?lank|punjab|desi|masala|curry|tandoor|biryani|dosa|chaat|halal|bombay|mumbai|delhi|madras|gujarat|kerala|hyderabad|swad|namaste|taj|spice)/i;

function isDesi(tags: Record<string, string>) {
  const haystack = `${tags.name ?? ""} ${tags.cuisine ?? ""} ${tags["cuisine:type"] ?? ""}`;
  return DESI_HINT.test(haystack);
}

function classify(tags: Record<string, string>): Target | null {
  for (const target of TARGETS) {
    const match = target.selector.match(/\["([^"]+)"="([^"]+)"\]/);
    if (!match) continue;
    if (tags[match[1]] !== match[2]) continue;
    if (target.desiOnly && !isDesi(tags)) continue;
    return target;
  }
  return null;
}

async function overpass(area: [number, number, number, number]) {
  const [south, west, north, east] = area;
  const bbox = `(${south},${west},${north},${east})`;
  const body = TARGETS.map((target) => `  nwr${target.selector}${bbox};`).join("\n");
  const query = `[out:json][timeout:180];\n(\n${body}\n);\nout center tags;`;

  // The public instance is rate-limited and often replies 429/504 under load.
  for (let attempt = 1; ; attempt += 1) {
    // eslint-disable-next-line no-await-in-loop
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        // Overpass rejects requests without a contactable agent (HTTP 406).
        "User-Agent": "godesi.com starter listing import (admin@godesi.com)",
      },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (response.ok) {
      const payload = (await response.json()) as { elements: OverpassElement[] };
      return payload.elements ?? [];
    }
    if (attempt >= 4) throw new Error(`Overpass HTTP ${response.status}`);
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, attempt * 20_000));
  }
}

function addressOf(tags: Record<string, string>) {
  return (
    [tags["addr:housenumber"], tags["addr:street"], tags["addr:suburb"]]
      .filter(Boolean)
      .join(" ") || null
  );
}

async function importCity(
  city: (typeof CITIES)[number],
  remaining: Map<string, number>,
  perCityPerCategory: number,
) {
  const elements = await overpass(city.area);
  const takenHere = new Map<string, number>();
  let created = 0;
  let updated = 0;

  for (const element of elements) {
    const tags = element.tags ?? {};
    const name = tags.name?.trim();
    if (!name || name.length > 120) continue;
    const target = classify(tags);
    if (!target) continue;

    const left = remaining.get(target.categorySlug) ?? 0;
    if (left <= 0) continue;
    if ((takenHere.get(target.categorySlug) ?? 0) >= perCityPerCategory) continue;

    const osmId = `${element.type}/${element.id}`;
    const address = addressOf(tags);
    const phone = tags.phone ?? tags["contact:phone"] ?? null;
    const websiteUrl = tags.website ?? tags["contact:website"] ?? null;

    // eslint-disable-next-line no-await-in-loop
    const existing = await db.business.findUnique({ where: { osmId } });
    if (existing) {
      // Never clobber a listing somebody has claimed and edited.
      if (existing.source !== "osm" || existing.ownerId) continue;
      // eslint-disable-next-line no-await-in-loop
      await db.business.update({
        where: { id: existing.id },
        data: { name, city: city.name, state: city.state, address, phone, websiteUrl },
      });
      updated += 1;
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const duplicate = await db.business.findFirst({
      where: { name, city: city.name },
      select: { id: true },
    });
    if (duplicate) continue;

    const base = slugify(`${name} ${city.name}`) || `listing-${element.id}`;
    // eslint-disable-next-line no-await-in-loop
    const clash = await db.business.findUnique({ where: { slug: base }, select: { id: true } });

    // eslint-disable-next-line no-await-in-loop
    await db.business.create({
      data: {
        slug: clash ? `${base}-${element.id}` : base,
        osmId,
        source: "osm",
        name,
        profileType: target.profileType,
        category: target.categorySlug,
        categorySlug: target.categorySlug,
        subcategorySlug: subcategorySlug(target.categorySlug, target.subcategory),
        city: city.name,
        state: city.state,
        address,
        phone,
        websiteUrl,
        status: "APPROVED",
      },
    });

    created += 1;
    remaining.set(target.categorySlug, left - 1);
    takenHere.set(target.categorySlug, (takenHere.get(target.categorySlug) ?? 0) + 1);
  }

  return { created, updated, seen: elements.length };
}

async function main() {
  const perCategory = Number(process.argv[2] ?? 10);
  const categorySlugs = Array.from(new Set(TARGETS.map((target) => target.categorySlug)));

  // Count what previous runs already seeded so re-runs top up instead of piling on.
  const remaining = new Map<string, number>();
  for (const slug of categorySlugs) {
    // eslint-disable-next-line no-await-in-loop
    const have = await db.business.count({ where: { source: "osm", categorySlug: slug } });
    remaining.set(slug, Math.max(0, perCategory - have));
  }

  const perCityPerCategory = Math.max(1, Math.ceil(perCategory / 3));

  for (const city of CITIES) {
    if (Array.from(remaining.values()).every((left) => left <= 0)) break;
    try {
      // eslint-disable-next-line no-await-in-loop
      const result = await importCity(city, remaining, perCityPerCategory);
      console.log(
        `${city.name}, ${city.state}: +${result.created} new, ${result.updated} refreshed (${result.seen} OSM rows)`,
      );
    } catch (error) {
      console.log(`${city.name}: failed — ${(error as Error).message}`);
    }
    // Overpass asks for a pause between heavy queries.
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  const total = await db.business.count({ where: { source: "osm" } });
  const short = categorySlugs.filter((slug) => (remaining.get(slug) ?? 0) > 0);
  console.log(`Starter listings from OpenStreetMap: ${total}`);
  if (short.length) console.log(`Still short of ${perCategory}: ${short.join(", ")}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
