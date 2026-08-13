import type { PostedByRole, PropertyGroup, Prisma } from "@prisma/client";

/**
 * Real-estate taxonomy shared by the post form, the filters and the spec sheet
 * on a listing. Everything is slug + label so a new type can be added here
 * without a migration, and unknown values coming from a form are dropped.
 */

export type Option = { slug: string; label: string };

export const PROPERTY_GROUP_LABELS: Record<PropertyGroup, string> = {
  RESIDENTIAL: "Residential",
  COMMERCIAL: "Commercial",
  LAND: "Land / plot",
  NEW_PROJECT: "New project",
};

export const PROPERTY_GROUP_EMOJI: Record<PropertyGroup, string> = {
  RESIDENTIAL: "🏠",
  COMMERCIAL: "🏢",
  LAND: "🌍",
  NEW_PROJECT: "🏗️",
};

export const PROPERTY_GROUPS: PropertyGroup[] = [
  "RESIDENTIAL",
  "COMMERCIAL",
  "LAND",
  "NEW_PROJECT",
];

/** Property types offered per group, in the order buyers expect them. */
export const PROPERTY_TYPES: Record<PropertyGroup, Option[]> = {
  RESIDENTIAL: [
    { slug: "apartment", label: "Apartment / flat" },
    { slug: "independent-house", label: "Independent house" },
    { slug: "villa", label: "Villa" },
    { slug: "builder-floor", label: "Builder floor" },
    { slug: "studio", label: "Studio / 1 RK" },
    { slug: "pg-hostel", label: "PG / hostel" },
    { slug: "farmhouse", label: "Farmhouse" },
  ],
  COMMERCIAL: [
    { slug: "office-space", label: "Office space" },
    { slug: "shop-retail", label: "Shop / retail" },
    { slug: "showroom", label: "Showroom" },
    { slug: "warehouse", label: "Warehouse / industrial" },
    { slug: "coworking", label: "Co-working seat" },
    { slug: "restaurant-space", label: "Restaurant / kitchen space" },
  ],
  LAND: [
    { slug: "residential-plot", label: "Residential plot" },
    { slug: "commercial-plot", label: "Commercial plot" },
    { slug: "agricultural-land", label: "Agricultural land" },
    { slug: "industrial-land", label: "Industrial land" },
  ],
  NEW_PROJECT: [
    { slug: "builder-project", label: "Builder project" },
    { slug: "under-construction", label: "Under construction" },
    { slug: "ready-to-move", label: "Ready to move" },
  ],
};

const TYPE_LABELS = new Map(
  PROPERTY_GROUPS.flatMap((group) =>
    PROPERTY_TYPES[group].map((type) => [type.slug, type.label] as const),
  ),
);

export function propertyTypeLabel(slug: string) {
  return TYPE_LABELS.get(slug) ?? slug;
}

export function groupForType(slug: string): PropertyGroup | null {
  return (
    PROPERTY_GROUPS.find((group) =>
      PROPERTY_TYPES[group].some((type) => type.slug === slug),
    ) ?? null
  );
}

export const POSTED_BY_LABELS: Record<PostedByRole, string> = {
  OWNER: "Owner",
  AGENT: "Agent",
  BUILDER: "Builder",
};

export const AREA_UNITS: Option[] = [
  { slug: "sqft", label: "sq ft" },
  { slug: "sqm", label: "sq m" },
  { slug: "sqyd", label: "sq yd" },
  { slug: "acre", label: "acres" },
  { slug: "guntha", label: "guntha" },
];

export const PROPERTY_AGES: Option[] = [
  { slug: "under-construction", label: "Under construction" },
  { slug: "new", label: "Newly built" },
  { slug: "0-5", label: "0–5 years old" },
  { slug: "5-10", label: "5–10 years old" },
  { slug: "10-20", label: "10–20 years old" },
  { slug: "20-plus", label: "20+ years old" },
];

export const FACINGS: Option[] = [
  { slug: "north", label: "North" },
  { slug: "east", label: "East" },
  { slug: "south", label: "South" },
  { slug: "west", label: "West" },
  { slug: "north-east", label: "North-east" },
  { slug: "north-west", label: "North-west" },
  { slug: "south-east", label: "South-east" },
  { slug: "south-west", label: "South-west" },
];

export const OWNERSHIPS: Option[] = [
  { slug: "freehold", label: "Freehold" },
  { slug: "leasehold", label: "Leasehold" },
  { slug: "co-op-society", label: "Co-operative society" },
  { slug: "power-of-attorney", label: "Power of attorney" },
  { slug: "builder-allotment", label: "Builder allotment" },
];

export const TENANT_PREFS: Option[] = [
  { slug: "anyone", label: "Anyone" },
  { slug: "family", label: "Family" },
  { slug: "bachelors", label: "Bachelors" },
  { slug: "company", label: "Company lease" },
  { slug: "students", label: "Students" },
];

export const UTILITIES: Option[] = [
  { slug: "water-24x7", label: "24×7 water supply" },
  { slug: "power-backup", label: "Power backup" },
  { slug: "gated-security", label: "Gated security" },
  { slug: "gas-pipeline", label: "Piped gas" },
  { slug: "internet", label: "Internet ready" },
  { slug: "rain-water", label: "Rainwater harvesting" },
];

export const AMENITIES: Option[] = [
  { slug: "lift", label: "Lift" },
  { slug: "swimming-pool", label: "Swimming pool" },
  { slug: "gym", label: "Gym" },
  { slug: "clubhouse", label: "Clubhouse" },
  { slug: "park", label: "Park / garden" },
  { slug: "play-area", label: "Children's play area" },
  { slug: "visitor-parking", label: "Visitor parking" },
  { slug: "fire-safety", label: "Fire safety" },
  { slug: "shopping-centre", label: "Shopping centre nearby" },
  { slug: "temple", label: "Temple nearby" },
  { slug: "vegetarian-only", label: "Vegetarian-only building" },
  { slug: "pet-friendly", label: "Pet friendly" },
  { slug: "modular-kitchen", label: "Modular kitchen" },
];

const ALL_LABELS = new Map(
  [
    ...AMENITIES,
    ...UTILITIES,
    ...PROPERTY_AGES,
    ...FACINGS,
    ...OWNERSHIPS,
    ...TENANT_PREFS,
    ...AREA_UNITS,
  ].map((option) => [option.slug, option.label] as const),
);

/** Human label for any taxonomy slug; falls back to the slug itself. */
export function optionLabel(slug: string) {
  return ALL_LABELS.get(slug) ?? slug;
}

/** Keeps only slugs we know about, so a hand-crafted POST cannot inject text. */
export function keepOptions(values: string[], allowed: Option[]) {
  const known = new Set(allowed.map((option) => option.slug));
  return Array.from(new Set(values.filter((value) => known.has(value))));
}

export function isPropertyGroup(value: string): value is PropertyGroup {
  return (PROPERTY_GROUPS as string[]).includes(value);
}

export function isPostedByRole(value: string): value is PostedByRole {
  return value === "OWNER" || value === "AGENT" || value === "BUILDER";
}

/** Only these types ever want BHK, bathrooms and furnishing. */
export function wantsRooms(type: string | null | undefined) {
  if (!type) return true;
  const group = groupForType(type);
  return group === "RESIDENTIAL" || group === "NEW_PROJECT";
}

export function areaLabel(
  listing: { builtUpArea: number | null; carpetArea: number | null; areaUnit: string | null },
) {
  const unit = optionLabel(listing.areaUnit ?? "sqft");
  const built = listing.builtUpArea ? `${listing.builtUpArea} ${unit} built-up` : null;
  const carpet = listing.carpetArea ? `${listing.carpetArea} ${unit} carpet` : null;
  return [built, carpet].filter(Boolean).join(" · ") || null;
}

export type PropertyFilterParams = {
  group?: string;
  ptype?: string;
  min?: string;
  max?: string;
  bhk?: string;
  baths?: string;
  furnishing?: string;
  parking?: string;
  amenity?: string | string[];
  by?: string;
  tenant?: string;
  nri?: string;
  deal?: string;
};

function intOrNull(value?: string) {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function asArray(value?: string | string[]) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Property-only half of the /real-estate filter bar, merged into the generic
 * listing filter so both sets of URL params keep working.
 */
export function propertyWhere(filters: PropertyFilterParams): Prisma.ListingWhereInput {
  const min = intOrNull(filters.min);
  const baths = intOrNull(filters.baths);
  const amenities = keepOptions(asArray(filters.amenity), AMENITIES);
  const group = filters.group && isPropertyGroup(filters.group) ? filters.group : null;
  const type = filters.ptype && TYPE_LABELS.has(filters.ptype) ? filters.ptype : null;
  const by = filters.by && isPostedByRole(filters.by) ? filters.by : null;
  const tenant = TENANT_PREFS.some((option) => option.slug === filters.tenant)
    ? filters.tenant
    : null;

  return {
    ...(group ? { propertyGroup: group } : {}),
    ...(type ? { propertyType: type } : {}),
    ...(min ? { price: { gte: min } } : {}),
    ...(baths ? { bathrooms: { gte: baths } } : {}),
    ...(amenities.length ? { amenities: { hasEvery: amenities } } : {}),
    ...(by ? { postedByRole: by } : {}),
    ...(tenant ? { tenantPref: tenant } : {}),
    ...(filters.parking ? { parkingCar: { gte: 1 } } : {}),
    ...(filters.nri ? { nriFriendly: true } : {}),
    ...(filters.deal ? { investmentDeal: true } : {}),
  };
}

/** True when the visitor has narrowed the list beyond the defaults. */
export function hasPropertyFilters(filters: PropertyFilterParams) {
  return Object.entries(filters).some(([, value]) =>
    Array.isArray(value) ? value.length > 0 : Boolean(value),
  );
}
