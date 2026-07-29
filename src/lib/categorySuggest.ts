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
  "business-services-printing-and-signage": ["printing", "banner", "signage", "flyer"],
  "business-services-courier-and-logistics": [
    "courier",
    "shipping",
    "freight",
    "logistics",
    "trucking",
  ],
  "business-services-staffing-and-hr": ["staffing", "recruitment", "hr", "payroll"],
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
  "real-estate-commercial-property": ["commercial", "office space", "retail space"],
  "real-estate-property-management": ["property management", "landlord", "tenant"],
  "real-estate-builders-and-developers": ["builder", "developer", "construction"],
  "home-services-plumbers": ["plumbing", "plumber", "leak", "pipe"],
  "home-services-electricians": ["electrical", "electrician", "wiring"],
  "home-services-ac-repair-and-service": ["hvac", "air conditioning", "ac", "heating"],
  "home-services-home-cleaning": ["cleaning", "cleaner", "deep clean"],
  "home-services-packers-and-movers": ["movers", "moving", "packers", "relocation"],
  "home-services-handyman-and-odd-jobs": ["handyman", "repairs", "odd jobs"],
  "home-services-interior-designers": ["interior", "kitchen design", "remodel"],
  "home-services-pest-control": ["pest", "termite", "rodent"],
  "home-services-painters": ["painting", "painter"],
  "home-services-elder-care": ["senior care", "elder care", "caregiver"],
  "home-services-babysitting-and-nanny": ["nanny", "babysitter", "childcare"],
  "food-catering-caterers": ["catering", "caterer", "party food"],
  "food-catering-tiffin-and-dabba-service": ["tiffin", "dabba", "meal service", "lunch box"],
  "food-catering-bakers-and-cakes": ["bakery", "cake", "cupcake", "baker"],
  "food-catering-restaurants": ["restaurant", "dhaba", "cafe", "eatery"],
  "food-catering-cloud-kitchens": ["cloud kitchen", "home kitchen", "delivery only"],
  "education-home-tutors": ["tutor", "tuition", "tutoring", "maths", "science"],
  "education-coaching-centres": ["coaching", "test prep", "sat", "gre"],
  "education-playschools-and-daycare": ["daycare", "preschool", "playschool"],
  "education-music-classes": ["music", "singing", "tabla", "guitar", "keyboard"],
  "education-dance-classes": ["dance", "bharatanatyam", "kathak", "bollywood dance"],
  "it-training-it-training-institutes": ["it training", "java", "python", "testing course"],
  "it-training-opt-cpt-training": ["opt", "cpt", "day 1 cpt"],
  "it-training-h1b-and-visa-support": ["h1b", "sponsorship", "work visa"],
  "beauty-lifestyle-salons-and-parlours": ["salon", "parlour", "haircut", "barber"],
  "beauty-lifestyle-bridal-makeup": ["bridal makeup", "dulhan makeup"],
  "beauty-lifestyle-spa-and-massage": ["spa", "massage", "body massage"],
  "beauty-lifestyle-gyms-and-fitness": ["gym", "fitness", "personal trainer"],
  "beauty-lifestyle-yoga-classes": ["yoga", "meditation", "pranayama"],
  "beauty-lifestyle-mehndi-artists": ["mehndi", "henna"],
  "beauty-lifestyle-boutiques-and-tailors": ["tailor", "boutique", "stitching", "alteration"],
  "events-wedding-wedding-planners": ["wedding planner", "shaadi planner", "event planner"],
  "events-wedding-photographers": ["photographer", "photography", "photo shoot"],
  "events-wedding-videographers": ["videographer", "cinematography", "wedding video"],
  "events-wedding-dj-and-sound": ["dj", "sound", "music system"],
  "events-wedding-decorators-and-florists": ["decorator", "decoration", "florist", "flowers"],
  "events-wedding-banquet-halls": ["banquet", "hall", "venue"],
  "religious-services-pandits-and-purohits": ["pandit", "priest", "pooja", "puja", "havan"],
  "religious-services-astrologers": ["astrology", "astrologer", "kundli", "horoscope"],
  "travel-travel-agents": ["travel agent", "tickets", "tour package", "flights"],
  "travel-taxi-and-cab-services": ["taxi", "cab", "airport pickup", "uber"],
  "travel-carpool-and-rideshare": ["carpool", "rideshare", "ride share"],
  "travel-visa-and-passport": ["passport", "visa stamping", "ckgs", "oci"],
  "jobs-drivers": ["driver", "chauffeur", "cdl"],
  "jobs-freelancers": ["freelance", "freelancer", "contract work"],
  "jobs-placement-consultants": ["placement", "job consultant", "recruiter"],
  "buy-sell-cars-and-bikes": ["car", "bike", "used car", "vehicle"],
  "buy-sell-furniture": ["furniture", "sofa", "bed", "mattress"],
  "buy-sell-mobiles-and-electronics": ["mobile", "phone", "laptop", "electronics"],
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
      const haystack = `${child.name} ${category.name} ${synonyms.join(" ")}`.toLowerCase();
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
