import { CATEGORY_TREE, subcategorySlug } from "@/lib/categories";
import { searchBusinesses, type BusinessListItem } from "@/lib/businesses";
import { planRank } from "@/lib/plans";

export const WEDDING_SLUG = "events-wedding";

export type WeddingGroup = {
  title: string;
  icon: string;
  /** Subcategory names, exactly as they appear in the taxonomy. */
  items: string[];
};

/**
 * The shaadi taxonomy shown on /wedding: two browsable levels (group → service)
 * on top of the flat category/subcategory tables the rest of the site uses.
 */
export const WEDDING_GROUPS: WeddingGroup[] = [
  {
    title: "Bridal & groom",
    icon: "👰",
    items: [
      "Makeup Artists",
      "Hair Stylists",
      "Mehndi Artists",
      "Saree Draping & Pagri Tying",
      "Bridal Wear",
      "Groom Wear",
      "Tailoring & Alterations",
      "Jewellery",
    ],
  },
  {
    title: "Photography & video",
    icon: "📸",
    items: [
      "Photographers",
      "Videographers",
      "Pre-Wedding Shoots",
      "Drone Photography",
      "Photo Booths",
      "Live Streaming",
    ],
  },
  {
    title: "Catering",
    icon: "🍛",
    items: [
      "Caterers",
      "Regional Cuisine Catering",
      "Dessert & Cake Vendors",
      "Wedding Cakes",
      "Bartending & Bar Service",
    ],
  },
  {
    title: "Entertainment",
    icon: "🎶",
    items: [
      "DJ & Sound",
      "Live Bands",
      "Dhol & Baraat",
      "Dance Choreographers",
      "Anchors & Artists",
      "Fireworks & Sparklers",
      "Cold Sparklers & Special Effects",
    ],
  },
  {
    title: "Decor & planning",
    icon: "🎪",
    items: [
      "Wedding Planners",
      "Wedding Coordinators",
      "Decorators & Florists",
      "Mandap Setup",
      "Floral Designers",
      "Tent & Lighting",
      "Event Rentals & Supplies",
      "Stage & Sound Rentals",
    ],
  },
  {
    title: "Venues",
    icon: "🏛",
    items: [
      "Banquet Halls & Venues",
      "Hotels",
      "Outdoor Venues",
      "Destination Weddings",
    ],
  },
  {
    title: "Transport",
    icon: "🚗",
    items: [
      "Luxury Cars",
      "Baraat Horse & Carriage",
      "Guest Transport",
      "Valet & Guest Parking",
      "Honeymoon & Travel",
    ],
  },
  {
    title: "Religious & rituals",
    icon: "🛕",
    items: [
      "Pandits",
      "Gurudwara Services",
      "Nikah Services",
      "Church & Interfaith Officiants",
      "Astrologers & Horoscope Matching",
    ],
  },
  {
    title: "Invitations & gifts",
    icon: "💌",
    items: ["Invitation Cards", "Digital Invites", "Gift Hampers"],
  },
  {
    title: "Before the wedding",
    icon: "💍",
    items: ["Marriage Bureaus", "Matchmaking Services"],
  },
  {
    title: "Practical",
    icon: "🛡️",
    items: ["Security Services", "Wedding Loans & Insurance"],
  },
];

export function weddingServiceSlug(name: string) {
  return subcategorySlug(WEDDING_SLUG, name);
}

const weddingCategory = CATEGORY_TREE.find(
  (category) => category.slug === WEDDING_SLUG,
);

/** Every slug under the wedding tree, used when no single service is picked. */
export function allWeddingSlugs() {
  return [
    WEDDING_SLUG,
    ...(weddingCategory?.children ?? []).map(weddingServiceSlug),
  ];
}

export function weddingServiceName(slug: string) {
  return (weddingCategory?.children ?? []).find(
    (child) => weddingServiceSlug(child) === slug,
  );
}

export type WeddingFilters = {
  service?: string;
  city?: string;
  minRating?: number;
  q?: string;
  /** Keeps vendors whose starting price fits, plus quote-on-request vendors. */
  budget?: number;
};

/** Vendors for the marketplace grid: paid and featured cards rank first. */
export async function weddingVendors(
  filters: WeddingFilters = {},
  take = 48,
): Promise<BusinessListItem[]> {
  const scope =
    filters.service && filters.service !== WEDDING_SLUG
      ? [filters.service]
      : allWeddingSlugs();

  const vendors = await searchBusinesses({
    categorySlugs: scope,
    city: filters.city,
    q: filters.q,
    minRating: filters.minRating,
    take,
  });

  const budget = filters.budget;
  if (!budget) return vendors;
  return vendors.filter(
    (vendor) => vendor.startingPrice === null || vendor.startingPrice <= budget,
  );
}

export async function featuredWeddingVendors(take = 8) {
  const vendors = await weddingVendors({}, 60);
  return vendors
    .filter((vendor) => vendor.featured || planRank(vendor.plan) > 0)
    .slice(0, take);
}
