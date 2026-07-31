/**
 * The Godesi directory taxonomy. This is the source of truth: `npm run db:categories`
 * upserts it into the `Category` table, so adding a subcategory here is a one-line change.
 */
export type CategorySeed = {
  slug: string;
  name: string;
  icon: string;
  color: CategoryColor;
  blurb: string;
  children: string[];
};

export type CategoryColor =
  | "rose"
  | "orange"
  | "amber"
  | "lime"
  | "emerald"
  | "teal"
  | "sky"
  | "indigo"
  | "violet"
  | "fuchsia"
  | "cyan";

/** Colourful gradients keyed by category, used across tiles, chips and headers. */
export const CATEGORY_GRADIENTS: Record<CategoryColor, string> = {
  rose: "from-rose-500 to-pink-500",
  orange: "from-orange-500 to-amber-500",
  amber: "from-amber-400 to-yellow-500",
  lime: "from-lime-500 to-green-500",
  emerald: "from-emerald-500 to-teal-500",
  teal: "from-teal-500 to-cyan-500",
  sky: "from-sky-500 to-blue-500",
  indigo: "from-indigo-500 to-violet-500",
  violet: "from-violet-500 to-purple-500",
  fuchsia: "from-fuchsia-500 to-pink-500",
  cyan: "from-cyan-500 to-sky-500",
};

export const CATEGORY_SOFT: Record<CategoryColor, string> = {
  rose: "bg-rose-50 text-rose-700 border-rose-200",
  orange: "bg-orange-50 text-orange-700 border-orange-200",
  amber: "bg-amber-50 text-amber-800 border-amber-200",
  lime: "bg-lime-50 text-lime-700 border-lime-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  teal: "bg-teal-50 text-teal-700 border-teal-200",
  sky: "bg-sky-50 text-sky-700 border-sky-200",
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  violet: "bg-violet-50 text-violet-700 border-violet-200",
  fuchsia: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  cyan: "bg-cyan-50 text-cyan-700 border-cyan-200",
};

export function gradientFor(color: string) {
  return CATEGORY_GRADIENTS[color as CategoryColor] ?? CATEGORY_GRADIENTS.indigo;
}

export function softFor(color: string) {
  return CATEGORY_SOFT[color as CategoryColor] ?? CATEGORY_SOFT.indigo;
}

export const CATEGORY_TREE: CategorySeed[] = [
  {
    slug: "home-services",
    name: "Home Services",
    icon: "🏠",
    color: "sky",
    blurb: "Plumbers, electricians, cleaning, pest control and repairs",
    children: [
      "Plumbers",
      "Electricians",
      "Carpenters",
      "AC Repair & Service",
      "Home Cleaning",
      "Housekeeping & Maid Service",
      "Car Wash & Detailing",
      "Babysitting & Nanny",
      "Elder Care",
      "Snow Removal & Yard Work",
      "Handyman & Odd Jobs",
      "Pest Control",
      "Painters",
      "Packers & Movers",
      "Interior Designers",
      "Appliance Repair",
    ],
  },
  {
    slug: "it-training",
    name: "IT Training & Career Services",
    icon: "💻",
    color: "cyan",
    blurb: "Courses, OPT/CPT & H1B support, placement and corporate training",
    children: [
      "IT Training Institutes",
      "Online Bootcamps",
      "OPT / CPT Training",
      "H1B & Visa Support",
      "Corporate Training",
      "Interview & Resume Prep",
      "Placement Assistance",
      "Staffing & Consulting",
    ],
  },
  {
    slug: "education",
    name: "Education & Training",
    icon: "🎓",
    color: "indigo",
    blurb: "Tutors, coaching, music, languages and skill classes",
    children: [
      "Home Tutors",
      "Coaching Centres",
      "Playschools & Daycare",
      "Music Classes",
      "Dance Classes",
      "Language Classes",
      "Computer Training",
      "Study Abroad Consultants",
      "Sports Coaching",
    ],
  },
  {
    slug: "business-services",
    name: "Business & Professional Services",
    icon: "💼",
    color: "emerald",
    blurb: "CAs, lawyers, printing, web, marketing and consultants",
    children: [
      "Chartered Accountants",
      "GST & Tax Consultants",
      "Lawyers & Legal",
      "Printing & Signage",
      "Web & App Development",
      "Digital Marketing",
      "Courier & Logistics",
      "Staffing & HR",
      "Insurance Agents",
    ],
  },
  {
    slug: "real-estate",
    name: "Real Estate & Homes",
    icon: "🏢",
    color: "orange",
    blurb: "Buy, sell, rent — agents, builders and home loans",
    children: [
      "Real Estate Agents",
      "Flats for Sale",
      "Flats for Rent",
      "Plots & Land",
      "Commercial Property",
      "Builders & Developers",
      "Home Loans",
      "Property Management",
    ],
  },
  {
    slug: "rooms-roommates",
    name: "Rooms & Roommates",
    icon: "🛋️",
    color: "teal",
    blurb: "Need a room or have one to share — PGs, flatmates and hostels",
    children: [
      "Need a Room",
      "Have a Room",
      "PG & Hostels",
      "Shared Flats",
      "Student Accommodation",
      "Girls PG",
      "Boys PG",
      "Short Stay & Sublet",
    ],
  },
  {
    slug: "beauty-lifestyle",
    name: "Beauty & Lifestyle",
    icon: "💅",
    color: "fuchsia",
    blurb: "Salons, spas, makeup artists, gyms and wellness",
    children: [
      "Salons & Parlours",
      "Bridal Makeup",
      "Spa & Massage",
      "Gyms & Fitness",
      "Yoga Classes",
      "Mehndi Artists",
      "Tattoo Studios",
      "Boutiques & Tailors",
    ],
  },
  {
    slug: "events-wedding",
    name: "Wedding & Event Services",
    icon: "💐",
    color: "rose",
    blurb: "Planners, photographers, makeup, decorators, DJs and venues",
    children: [
      "Wedding Planners",
      "Photographers",
      "Videographers",
      "Makeup Artists",
      "Decorators & Florists",
      "DJ & Sound",
      "Caterers",
      "Banquet Halls & Venues",
      "Bridal Wear",
      "Jewellery",
      "Marriage Bureaus",
      "Anchors & Artists",
      "Tent & Lighting",
      "Mehndi Artists",
      "Groom Wear",
      "Pre-Wedding Shoots",
      "Drone Photography",
      "Regional Cuisine Catering",
      "Dessert & Cake Vendors",
      "Live Bands",
      "Dhol & Baraat",
      "Dance Choreographers",
      "Mandap Setup",
      "Floral Designers",
      "Hotels",
      "Outdoor Venues",
      "Destination Weddings",
      "Luxury Cars",
      "Baraat Horse & Carriage",
      "Guest Transport",
      "Pandits",
      "Gurudwara Services",
      "Nikah Services",
      "Invitation Cards",
      "Digital Invites",
      "Gift Hampers",
    ],
  },
  {
    slug: "food-catering",
    name: "Food & Catering",
    icon: "🍛",
    color: "amber",
    blurb: "Caterers, tiffin services, bakers, sweets and restaurants",
    children: [
      "Caterers",
      "Tiffin & Dabba Service",
      "Bakers & Cakes",
      "Sweet Shops",
      "Restaurants",
      "Grocery & Indian Stores",
      "Cloud Kitchens",
      "Chaat & Street Food",
      "Cooks & Chefs",
      "Cooking at Home",
    ],
  },
  {
    slug: "travel",
    name: "Travel & Transport",
    icon: "✈️",
    color: "cyan",
    blurb: "Agents, cabs, tempo travellers, hotels and visas",
    children: [
      "Travel Agents",
      "Carpool & Rideshare",
      "Taxi & Cab Services",
      "Tempo Traveller & Bus",
      "Hotels & Resorts",
      "Homestays",
      "Visa & Passport",
      "Pilgrimage Tours",
      "Car Rentals",
    ],
  },
  {
    slug: "religious-services",
    name: "Religious & Cultural",
    icon: "🪔",
    color: "violet",
    blurb: "Pandits, astrologers, pooja samagri, temples and katha",
    children: [
      "Pandits & Purohits",
      "Astrologers",
      "Pooja Samagri",
      "Temples & Trusts",
      "Katha & Bhajan Mandali",
      "Havan & Yagya",
      "Last Rites Services",
    ],
  },
  {
    slug: "jobs",
    name: "Jobs & Freelancers",
    icon: "🧑‍💻",
    color: "emerald",
    blurb: "Openings, freelancers, part-time work, drivers and househelp",
    children: [
      "Full Time Jobs",
      "Part Time Jobs",
      "Freelancers",
      "Work From Home",
      "Drivers",
      "Maids & Househelp",
      "Security Guards",
      "Sales & Marketing Jobs",
      "Placement Consultants",
    ],
  },
  {
    slug: "professionals",
    name: "Professionals & Experts",
    icon: "🎓",
    color: "cyan",
    blurb: "Attorneys, accountants, advisors, consultants and other experts",
    children: [
      "Attorneys",
      "Accountants",
      "Astrologers",
      "Consultants",
      "Insurance Agents",
      "Financial Advisors",
      "Immigration Consultants",
      "Doctors & Therapists",
    ],
  },
  {
    slug: "buy-sell",
    name: "Buy & Sell Marketplace",
    icon: "🛍️",
    color: "lime",
    blurb: "Second-hand deals, electronics, furniture and vehicles",
    children: [
      "Mobiles & Electronics",
      "Furniture",
      "Cars & Bikes",
      "Home Appliances",
      "Books & Stationery",
      "Clothing & Accessories",
      "Pets & Supplies",
      "Wholesale & Bulk",
    ],
  },
];

/**
 * Subcategories keep their original slug when we rename the label, so existing
 * cards, links and search filters keep working.
 */
const SUBCATEGORY_SLUGS: Record<string, string> = {
  "real-estate:Real Estate Agents": "real-estate-property-dealers",
};

export function subcategorySlug(parentSlug: string, name: string) {
  const override = SUBCATEGORY_SLUGS[`${parentSlug}:${name}`];
  if (override) return override;

  return `${parentSlug}-${name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}`;
}
