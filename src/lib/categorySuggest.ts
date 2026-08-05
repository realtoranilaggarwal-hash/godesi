export type SuggestCategory = {
  slug: string;
  name: string;
  icon: string;
  children: { slug: string; name: string }[];
};

export type CategorySuggestion = {
  categorySlug: string;
  categoryName: string;
  categoryIcon: string;
  subcategorySlug: string;
  subcategoryName: string;
};

/**
 * Words members actually type mapped onto subcategory slugs, so "financial planning"
 * or "mortgage" lands on the right card instead of sending them through 14 dropdowns.
 */
const SYNONYMS: Record<string, string[]> = {
  "professionals-financial-advisors": [
    "financial",
    "finance",
    "financial planning",
    "wealth",
    "investment",
    "investments",
    "mutual fund",
    "retirement",
    "401k",
    "annuity",
    "planner",
  ],
  "professionals-accountants": ["bookkeeping", "payroll", "cpa", "audit"],
  "professionals-attorneys": ["lawyer", "legal", "advocate", "attorney"],
  "professionals-insurance-agents": [
    "insurance",
    "life insurance",
    "health insurance",
    "auto insurance",
    "medicare",
  ],
  "professionals-immigration-consultants": [
    "immigration",
    "green card",
    "visa",
    "citizenship",
    "asylum",
  ],
  "professionals-doctors-and-therapists": [
    "doctor",
    "clinic",
    "dentist",
    "therapist",
    "counselling",
    "physician",
    "ayurveda",
  ],
  "professionals-consultants": ["consulting", "advisory", "strategy"],
  "business-services-chartered-accountants": ["ca", "chartered accountant"],
  "business-services-gst-and-tax-consultants": [
    "tax",
    "taxes",
    "itr",
    "gst",
    "tax filing",
    "tax preparer",
  ],
  "business-services-web-and-app-development": [
    "website",
    "web design",
    "software",
    "app",
    "developer",
    "it services",
  ],
  "business-services-digital-marketing": [
    "seo",
    "social media",
    "marketing",
    "ads",
    "branding",
  ],
  "business-services-printing-and-signage": [
    "printing",
    "banner",
    "signage",
    "flyer",
  ],
  "business-services-courier-and-logistics": [
    "courier",
    "shipping",
    "freight",
    "logistics",
    "trucking",
  ],
  "business-services-staffing-and-hr": [
    "staffing",
    "recruitment",
    "hr",
    "payroll",
  ],
  "real-estate-property-dealers": [
    "realtor",
    "real estate",
    "broker",
    "listing agent",
    "buyer agent",
  ],
  "real-estate-home-loans": [
    "mortgage",
    "home loan",
    "loan officer",
    "refinance",
    "lending",
    "hard money",
    "sba",
  ],
  "real-estate-commercial-property": [
    "commercial",
    "office space",
    "retail space",
  ],
  "real-estate-property-management": [
    "property management",
    "landlord",
    "tenant",
  ],
  "real-estate-builders-and-developers": [
    "builder",
    "developer",
    "construction",
  ],
  "home-services-plumbers": ["plumbing", "plumber", "leak", "pipe"],
  "home-services-electricians": ["electrical", "electrician", "wiring"],
  "home-services-ac-repair-and-service": [
    "hvac",
    "air conditioning",
    "ac",
    "heating",
  ],
  "home-services-home-cleaning": ["cleaning", "cleaner", "deep clean"],
  "home-services-packers-and-movers": [
    "movers",
    "moving",
    "packers",
    "relocation",
  ],
  "home-services-handyman-and-odd-jobs": ["handyman", "repairs", "odd jobs"],
  "home-services-interior-designers": ["interior", "kitchen design", "remodel"],
  "home-services-pest-control": ["pest", "termite", "rodent"],
  "home-services-painters": ["painting", "painter"],
  "home-services-elder-care": ["senior care", "elder care", "caregiver"],
  "home-services-babysitting-and-nanny": ["nanny", "babysitter", "childcare"],
  "food-catering-caterers": ["catering", "caterer", "party food"],
  "food-catering-tiffin-and-dabba-service": [
    "tiffin",
    "dabba",
    "meal service",
    "lunch box",
  ],
  "food-catering-bakers-and-cakes": ["bakery", "cake", "cupcake", "baker"],
  "food-catering-restaurants": ["restaurant", "dhaba", "cafe", "eatery"],
  "food-catering-cloud-kitchens": [
    "cloud kitchen",
    "home kitchen",
    "delivery only",
  ],
  "food-catering-breweries-and-taprooms": [
    "brewery",
    "brewhouse",
    "brew house",
    "brewpub",
    "microbrewery",
    "craft beer",
    "taproom",
    "beer",
  ],
  "food-catering-bars-and-pubs": [
    "bar",
    "pub",
    "lounge",
    "cocktail",
    "sports bar",
  ],
  "food-catering-cafes-and-tea-houses": [
    "cafe",
    "coffee shop",
    "chai",
    "tea house",
  ],
  "food-catering-food-trucks": ["food truck", "food cart"],
  "food-catering-wine-and-liquor-stores": [
    "liquor",
    "wine shop",
    "off licence",
  ],
  "food-catering-ice-cream-and-desserts": [
    "ice cream",
    "kulfi",
    "dessert",
    "falooda",
  ],
  "trade-sourcing-sourcing-agents": [
    "sourcing",
    "sourcing agent",
    "procurement",
    "buying agent",
  ],
  "trade-sourcing-garments-and-textiles": [
    "garment",
    "garments",
    "apparel",
    "textile",
    "fabric",
    "clothing manufacturer",
  ],
  "trade-sourcing-importers-and-exporters": [
    "import",
    "export",
    "exporter",
    "importer",
    "trading company",
  ],
  "trade-sourcing-manufacturers-and-factories": [
    "manufacturer",
    "factory",
    "production unit",
  ],
  "trade-sourcing-customs-clearing-and-freight": [
    "customs",
    "clearing agent",
    "freight forwarder",
    "cha",
  ],
  "health-medical-doctors-and-clinics": [
    "clinic",
    "physician",
    "gp",
    "family doctor",
  ],
  "health-medical-dentists": ["dentist", "dental", "orthodontist"],
  "health-medical-physiotherapy": ["physio", "physiotherapy", "rehab"],
  "health-medical-mental-health-and-counselling": [
    "therapy",
    "counsellor",
    "psychologist",
    "psychiatrist",
  ],
  "financial-services-tax-preparation-and-filing": [
    "tax preparation",
    "tax filing",
    "1040",
    "itr filing",
  ],
  "financial-services-mortgage-and-home-loans": [
    "mortgage broker",
    "home loan",
  ],
  "financial-services-money-transfer-and-forex": [
    "money transfer",
    "remittance",
    "forex",
    "currency exchange",
  ],
  "auto-services-car-repair-and-mechanics": [
    "mechanic",
    "auto repair",
    "garage",
    "car service",
  ],
  "auto-services-driving-schools": ["driving school", "driving lessons", "dmv"],
  "shops-retail-indian-grocery-stores": [
    "indian grocery",
    "desi store",
    "kirana",
    "supermarket",
  ],
  "shops-retail-jewellery-stores": ["jewellery", "jewelry", "gold shop"],
  "buy-sell-jewellery-and-gold": [
    "jewellery",
    "jewelry",
    "gold",
    "silver",
    "diamond",
    "necklace",
    "bangles",
    "earrings",
    "kundan",
    "polki",
  ],
  "buy-sell-artificial-and-fashion-jewellery": [
    "artificial jewellery",
    "imitation jewellery",
    "fashion jewellery",
    "costume jewellery",
    "oxidised",
  ],
  "buy-sell-sarees-and-ethnic-wear": [
    "saree",
    "sari",
    "salwar",
    "kurti",
    "ethnic wear",
    "suits",
  ],
  "buy-sell-bridal-wear-and-lehengas": ["lehenga", "bridal wear", "sherwani"],
  "buy-sell-handicrafts-and-home-decor": [
    "handicraft",
    "home decor",
    "showpiece",
    "rangoli",
    "diya",
  ],
  "buy-sell-handmade-and-custom-gifts": [
    "handmade",
    "custom gift",
    "personalised",
    "craft",
    "resin",
    "candles",
  ],
  "buy-sell-art-paintings-and-collectibles": [
    "painting",
    "artwork",
    "canvas",
    "sketch",
    "antique",
  ],
  "buy-sell-beauty-and-cosmetics": [
    "cosmetics",
    "makeup products",
    "skincare",
    "perfume",
  ],
  "buy-sell-kids-toys-and-baby-items": [
    "toys",
    "baby",
    "stroller",
    "kids items",
    "crib",
  ],
  "buy-sell-indian-groceries-and-spices": [
    "spices",
    "masala",
    "atta",
    "pickle",
    "papad",
  ],
  "buy-sell-homemade-food-and-sweets": [
    "homemade food",
    "tiffin",
    "sweets",
    "mithai",
    "cakes",
    "home baker",
  ],
  "buy-sell-kitchen-and-cookware": ["cookware", "utensils", "pressure cooker"],
  "buy-sell-musical-instruments": ["harmonium", "tabla for sale", "sitar"],
  "buy-sell-sports-and-fitness-gear": ["cricket kit", "treadmill", "bicycle"],
  "buy-sell-business-equipment-and-fixtures": [
    "restaurant equipment",
    "shop fixtures",
    "commercial oven",
  ],
  "buy-sell-free-and-giveaway": ["free", "giveaway", "donate"],
  "construction-general-contractors": [
    "contractor",
    "renovation",
    "remodeling",
  ],
  "construction-solar-installation": ["solar", "solar panels"],
  "community-orgs-indian-associations": [
    "association",
    "community organisation",
    "samaj",
    "sangh",
  ],
  "education-home-tutors": ["tutor", "tuition", "tutoring", "maths", "science"],
  "education-coaching-centres": ["coaching", "test prep", "sat", "gre"],
  "education-playschools-and-daycare": ["daycare", "preschool", "playschool"],
  "education-music-classes": [
    "music",
    "singing",
    "tabla",
    "guitar",
    "keyboard",
  ],
  "education-dance-classes": [
    "dance",
    "bharatanatyam",
    "kathak",
    "bollywood dance",
  ],
  "it-training-it-training-institutes": [
    "it training",
    "java",
    "python",
    "testing course",
  ],
  "it-training-opt-cpt-training": ["opt", "cpt", "day 1 cpt"],
  "it-training-h1b-and-visa-support": ["h1b", "sponsorship", "work visa"],
  "beauty-lifestyle-salons-and-parlours": [
    "salon",
    "parlour",
    "haircut",
    "barber",
  ],
  "beauty-lifestyle-bridal-makeup": ["bridal makeup", "dulhan makeup"],
  "beauty-lifestyle-spa-and-massage": ["spa", "massage", "body massage"],
  "beauty-lifestyle-gyms-and-fitness": ["gym", "fitness", "personal trainer"],
  "beauty-lifestyle-yoga-classes": ["yoga", "meditation", "pranayama"],
  "beauty-lifestyle-mehndi-artists": ["mehndi", "henna"],
  "beauty-lifestyle-boutiques-and-tailors": [
    "tailor",
    "boutique",
    "stitching",
    "alteration",
  ],
  "events-wedding-wedding-planners": [
    "wedding planner",
    "shaadi planner",
    "event planner",
  ],
  "events-wedding-photographers": [
    "photographer",
    "photography",
    "photo shoot",
  ],
  "events-wedding-videographers": [
    "videographer",
    "cinematography",
    "wedding video",
  ],
  "events-wedding-dj-and-sound": ["dj", "sound", "music system"],
  "events-wedding-decorators-and-florists": [
    "decorator",
    "decoration",
    "florist",
    "flowers",
  ],
  "events-wedding-banquet-halls-and-venues": ["banquet", "hall", "venue"],
  "religious-services-pandits-and-purohits": [
    "pandit",
    "priest",
    "pooja",
    "puja",
    "havan",
  ],
  "religious-services-astrologers": [
    "astrology",
    "astrologer",
    "kundli",
    "horoscope",
  ],
  "travel-travel-agents": [
    "travel agent",
    "tickets",
    "tour package",
    "flights",
  ],
  "travel-taxi-and-cab-services": ["taxi", "cab", "airport pickup", "uber"],
  "travel-carpool-and-rideshare": ["carpool", "rideshare", "ride share"],
  "travel-visa-and-passport": ["passport", "visa stamping", "ckgs", "oci"],
  "jobs-drivers": ["driver", "chauffeur", "cdl"],
  "jobs-freelancers": ["freelance", "freelancer", "contract work"],
  "jobs-placement-consultants": ["placement", "job consultant", "recruiter"],
  "buy-sell-cars-and-bikes": ["car", "bike", "used car", "vehicle"],
  "buy-sell-furniture": ["furniture", "sofa", "bed", "mattress"],
  "buy-sell-mobiles-and-electronics": [
    "mobile",
    "phone",
    "laptop",
    "electronics",
  ],
};

function tokens(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2);
}

/**
 * Ranks category/subcategory pairs against a free-text description of the trade.
 * Whole-phrase hits beat single words so "home loans" outranks "home cleaning".
 */
export function suggestCategories(
  query: string,
  categories: SuggestCategory[],
  limit = 5,
): CategorySuggestion[] {
  const text = query.toLowerCase().trim();
  if (text.length < 2) return [];
  const words = tokens(text);

  const scored = categories.flatMap((category) =>
    category.children.map((child) => {
      const synonyms = SYNONYMS[child.slug] ?? [];
      const haystack =
        `${child.name} ${category.name} ${synonyms.join(" ")}`.toLowerCase();
      const phrases = [child.name.toLowerCase(), ...synonyms];

      let score = 0;
      for (const phrase of phrases) {
        if (phrase.length > 3 && text.includes(phrase)) score += 6;
      }
      const haystackWords = new Set(tokens(haystack));
      for (const word of words) {
        if (haystackWords.has(word)) score += 2;
      }
      if (child.name.toLowerCase() === text) score += 10;

      return {
        score,
        suggestion: {
          categorySlug: category.slug,
          categoryName: category.name,
          categoryIcon: category.icon,
          subcategorySlug: child.slug,
          subcategoryName: child.name,
        },
      };
    }),
  );

  return scored
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row) => row.suggestion);
}
