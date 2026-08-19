/**
 * Per-subcategory professional profiles. Each set drives three things from one
 * definition: the extra fields on the posting form, the filters on the category
 * page and the tags on the cards — so a tag can never exist that nobody can
 * filter by, and a new profession is one entry away.
 */
import { subcategorySlug } from "@/lib/categories";

/** An extra tick-box or single-choice group, e.g. "Where do you work?". */
export type ChoiceGroup = {
  key: string;
  title: string;
  /** Wording for the requirement form, where the client is the one asking. */
  clientTitle?: string;
  hint?: string;
  options: string[];
  mode: "multi" | "single";
  /** Single-choice groups can be made mandatory, like spa service location. */
  required?: boolean;
};

/** The three price boxes a service profession may ask for. */
export type PriceField = {
  key: "priceFrom" | "priceHourly" | "priceExtra";
  label: string;
  hint: string;
};

/** A tab of the searchable picker, e.g. "Cloud & DevOps" courses. */
export type OptionTab = { title: string; options: string[] };

/** One click selects a whole career path, e.g. "DevOps Engineer Path". */
export type OptionBundle = { title: string; options: string[] };

export type SpecialtySet = {
  title: string;
  /** Wording for the requirement form, e.g. "What should the agent handle?". */
  clientTitle?: string;
  hint: string;
  options: string[];
  /**
   * Splits a long option list into searchable tabs. Every option must also
   * appear in `options`, which stays the single source of truth for filtering.
   */
  optionTabs?: OptionTab[];
  bundles?: OptionBundle[];
  /** Lets a provider add an option we do not list yet, e.g. a new course. */
  customOption?: { label: string; hint: string };
  /** Extra option groups; every answer is filterable on the category page. */
  choices?: ChoiceGroup[];
  pricing?: PriceField[];
  availability?: { label: string; hint: string };
  /** Optional licence or certificate upload, reviewed before any verified badge. */
  licenseDoc?: { label: string; hint: string };
  /** Replaces the generic credentials notice where the trade needs its own. */
  disclaimer?: string;
  certifications?: { title: string; options: string[] };
  /** Consultation fee or pricing model; `options` turns it into a dropdown. */
  fee?: { label: string; hint: string; options?: string[] };
  license?: { label: string; hint: string; required: boolean };
  /** Free-text list, e.g. the carriers an insurance agent represents. */
  carriers?: { label: string; hint: string };
  experience?: boolean;
};

export const CREDENTIALS_DISCLAIMER =
  "Users must provide accurate credentials. Licence numbers and certifications are shown publicly and may be verified — false claims get the listing removed.";

export const SPA_DISCLAIMER =
  "Professional service only. Godesi lists licensed therapists and spas for therapeutic massage and wellness services — any other request is banned and gets the provider and the member removed. Providers must give accurate credentials and verify their ID.";

/** The IT training course master list, grouped into the picker's tabs. */
const IT_COURSE_TABS: OptionTab[] = [
  {
    title: "Programming & Development",
    options: [
      "Java / J2EE",
      "Python",
      ".NET / C#",
      "JavaScript",
      "Node.js",
      "React.js",
      "Angular",
      "Full Stack Development",
      "Web Development",
      "Mobile App Development (iOS / Android / Flutter)",
    ],
  },
  {
    title: "Cloud & DevOps",
    options: [
      "AWS",
      "Microsoft Azure",
      "Google Cloud Platform",
      "DevOps",
      "Docker",
      "Kubernetes",
      "CI/CD",
    ],
  },
  {
    title: "Data & AI",
    options: [
      "Data Science",
      "Machine Learning",
      "Artificial Intelligence",
      "Data Analytics",
      "Big Data / Hadoop",
      "Power BI",
      "Tableau",
    ],
  },
  {
    title: "Cyber Security",
    options: [
      "Cyber Security",
      "Ethical Hacking",
      "Penetration Testing",
      "Information Security",
    ],
  },
  {
    title: "Enterprise Tools",
    options: [
      "SAP (All Modules)",
      "Salesforce",
      "ServiceNow",
      "Workday",
      "Oracle",
    ],
  },
  {
    title: "Networking & Infra",
    options: [
      "Networking",
      "Cisco (CCNA / CCNP)",
      "Linux / Unix",
      "VMware",
      "System Administration",
    ],
  },
  {
    title: "Business & QA",
    options: [
      "Business Analyst",
      "QA / Testing",
      "Automation Testing (Selenium)",
      "Digital Marketing",
      "Product Management",
    ],
  },
  {
    title: "Emerging Tech",
    options: [
      "Blockchain",
      "Internet of Things (IoT)",
      "AR / VR",
      "Robotics",
    ],
  },
];

/**
 * IT training institutes: courses plus the visa and career support students
 * actually search on, so "Data Science + OPT + Online" is one query.
 */
const IT_TRAINING_SET: SpecialtySet = {
  title: "Select the courses you teach",
  clientTitle: "Which courses are you looking for?",
  hint: "Search or open a tab, tick everything you teach — students filter on these.",
  options: IT_COURSE_TABS.flatMap((tab) => tab.options),
  optionTabs: IT_COURSE_TABS,
  bundles: [
    {
      title: "Full Stack Developer bundle",
      options: [
        "JavaScript",
        "React.js",
        "Node.js",
        "Full Stack Development",
        "Web Development",
      ],
    },
    {
      title: "Data Science career track",
      options: [
        "Python",
        "Data Science",
        "Machine Learning",
        "Data Analytics",
        "Power BI",
      ],
    },
    {
      title: "DevOps engineer path",
      options: ["DevOps", "Docker", "Kubernetes", "CI/CD", "Linux / Unix"],
    },
    {
      title: "Cloud architect path",
      options: [
        "AWS",
        "Microsoft Azure",
        "Google Cloud Platform",
        "Networking",
        "System Administration",
      ],
    },
  ],
  customOption: {
    label: "Other courses you teach",
    hint: "Comma separated, e.g. Snowflake Training, Databricks Advanced",
  },
  choices: [
    {
      key: "training",
      title: "Training type",
      clientTitle: "Training type you want",
      options: [
        "Classroom Training",
        "Online Training",
        "Hybrid Training",
        "Corporate Training",
        "One-to-One Training",
        "Weekend Batches",
        "Fast Track Courses",
      ],
      mode: "multi",
    },
    {
      key: "visa",
      title: "Visa & career support",
      clientTitle: "Visa & career support you need",
      hint: "What students on F1, OPT, CPT or H1B get from you",
      options: [
        "OPT Training Support",
        "CPT Training Support",
        "Internship Placement",
        "H1B Sponsorship Guidance",
        "H1B Transfer Support",
        "GC (Green Card) Processing Support",
        "Resume Preparation",
        "Mock Interviews",
        "Job Placement Assistance",
        "Real-Time Project Training",
        "Client Interview Support",
      ],
      mode: "multi",
    },
    {
      key: "mode",
      title: "Delivery mode",
      clientTitle: "Preferred delivery mode",
      options: ["Online", "Offline (Classroom)", "Hybrid"],
      mode: "multi",
      required: true,
    },
    {
      key: "level",
      title: "Experience level you teach",
      clientTitle: "Your experience level",
      options: ["Beginner", "Intermediate", "Advanced", "Career Switch"],
      mode: "multi",
    },
    {
      key: "highlights",
      title: "Highlights",
      clientTitle: "Must-haves",
      hint: "Only tick what you genuinely offer — false claims get the listing removed",
      options: [
        "⭐ Guaranteed Interview Calls",
        "⭐ 100% Placement Assistance",
        "⭐ Pay After Placement",
        "⭐ Live Project Training",
      ],
      mode: "multi",
    },
  ],
  pricing: [
    {
      key: "priceFrom",
      label: "Course fee from",
      hint: "Lowest course fee, e.g. $499",
    },
    {
      key: "priceHourly",
      label: "One-to-one rate",
      hint: "Optional — per hour or per session",
    },
  ],
  availability: {
    label: "Batch timings",
    hint: "e.g. Weekdays 7–9pm CST, weekend batches Sat–Sun 10am–1pm",
  },
  experience: true,
};

export const SPECIALTY_SETS: Record<string, SpecialtySet> = {
  "beauty-lifestyle-spa-and-massage": {
    title: "Select the treatments you offer",
    clientTitle: "Which treatments do you want?",
    hint: "Pick at least one — these show as tags on your card and let people filter for you.",
    options: [
      "Full Body Massage",
      "Deep Tissue Massage",
      "Swedish Massage",
      "Thai Massage",
      "Ayurvedic Massage",
      "Reflexology (Foot)",
      "Head / Scalp Massage",
      "Neck & Shoulder Therapy",
      "Sports Massage",
      "Prenatal Massage",
      "Couples Massage",
    ],
    choices: [
      {
        key: "location",
        title: "Where do you provide the service?",
        clientTitle: "Where do you want the service?",
        hint: "Members filter on this first — required.",
        mode: "single",
        required: true,
        options: [
          "At home (customer location)",
          "At spa / clinic",
          "Both home and spa",
        ],
      },
      {
        key: "focus",
        title: "Body focus areas",
        mode: "multi",
        options: ["Neck", "Back", "Shoulder", "Foot", "Head", "Full body"],
      },
      {
        key: "duration",
        title: "Session lengths",
        mode: "multi",
        options: ["30 minutes", "60 minutes", "90 minutes", "120 minutes"],
      },
      {
        key: "therapist",
        title: "Therapist available",
        clientTitle: "Therapist preference",
        mode: "multi",
        options: ["Male therapist", "Female therapist", "No preference"],
      },
    ],
    certifications: {
      title: "Certifications & licences",
      options: [
        "Licensed Massage Therapist (LMT)",
        "Certified Ayurvedic therapist",
        "Certified Thai massage therapist",
        "Certified reflexologist",
        "Prenatal massage certified",
        "Spa / clinic business licence",
      ],
    },
    license: {
      label: "Therapy licence number",
      hint: "Shown on your public card so members can look you up",
      required: false,
    },
    licenseDoc: {
      label: "Licence or certificate",
      hint: "Kept private for review — needed for the ✅ Verified provider badge",
    },
    pricing: [
      { key: "priceFrom", label: "Starting price", hint: "e.g. $60 for 30 minutes" },
      { key: "priceHourly", label: "Price per hour", hint: "e.g. $90 per hour" },
      { key: "priceExtra", label: "Home visit extra fee", hint: "Optional, e.g. +$20" },
    ],
    availability: {
      label: "Availability",
      hint: "Days and times, e.g. Mon–Sat 9am–8pm, Sun by appointment",
    },
    disclaimer: SPA_DISCLAIMER,
    experience: true,
  },

  "professionals-attorneys": {
    title: "Select legal services",
    clientTitle: "What legal help do you need?",
    hint: "Pick at least one — these show as tags on your card and let people filter for you.",
    options: [
      "Family Law (Divorce, Custody)",
      "Immigration Law",
      "Real Estate Law",
      "Criminal Defense",
      "Business / Corporate Law",
      "Personal Injury",
      "Estate Planning",
      "Tax Law",
      "Bankruptcy Law",
      "Employment Law",
      "Civil Litigation",
      "Contract Law",
      "Intellectual Property",
      "Insurance Claims",
      "Traffic / DUI",
    ],
    license: {
      label: "Bar licence number",
      hint: "State bar number — shown on your public card",
      required: false,
    },
    fee: { label: "Consultation fee", hint: "e.g. Free first consult, $150/hour" },
    experience: true,
  },

  "professionals-astrologers": {
    title: "Select astrology services",
    clientTitle: "What do you need help with?",
    hint: "Pick at least one — these show as tags on your card and let people filter for you.",
    options: [
      // Systems practised
      "Vedic astrology",
      "KP (Krishnamurti) astrology",
      "Nadi astrology",
      "Western astrology",
      "Chinese astrology",
      "Tarot reading",
      "Numerology",
      "Palmistry",
      "Face reading",
      "Handwriting analysis",
      "Vastu consultation",
      "Feng shui",
      // Readings people ask for
      "Horoscope / kundli reading",
      "Yearly / annual horoscope",
      "Marriage matching / compatibility",
      "Love & relationship reading",
      "Career & job reading",
      "Business & partnership reading",
      "Education & exam guidance",
      "Money & finance prediction",
      "Wealth & debt prediction",
      "Health prediction",
      "Property & vehicle prediction",
      "Childbirth & fertility reading",
      "Foreign travel & visa prediction",
      "Court case & dispute reading",
      "Muhurat (date & time selection)",
      "Naming (namkaran) suggestions",
      // Transits and remedies
      "Saturn (Shani) transit prediction",
      "Jupiter (Guru) transit prediction",
      "Rahu–Ketu transit prediction",
      "Mangal dosha / kuja dosha remedy",
      "Kaal sarp dosha remedy",
      "Pitra dosha remedy",
      "Gemstone consultation",
      "Rudraksha & yantra guidance",
      "Puja, homam & remedies",
      "Negative energy & evil eye remedies",
      "Spiritual healing & meditation guidance",
    ],
    choices: [
      {
        key: "mode",
        title: "How you consult",
        clientTitle: "How do you want the reading?",
        options: [
          "In person",
          "Phone call",
          "Video call",
          "WhatsApp / chat",
          "Written report",
          "At your home",
          "At the temple",
        ],
        mode: "multi",
      },
      {
        key: "languages",
        title: "Languages you read in",
        clientTitle: "Language you prefer",
        options: [
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
          "Sanskrit",
          "Urdu",
          "Nepali",
        ],
        mode: "multi",
      },
    ],
    certifications: {
      title: "Certifications",
      options: [
        "Jyotish Visharad",
        "Jyotish Acharya",
        "Certified Vastu Consultant",
        "Certified Tarot Reader",
        "Certified Numerologist",
        "Astrology diploma / degree",
      ],
    },
    fee: { label: "Consultation fee", hint: "e.g. $51 per reading, first 10 minutes free" },
    experience: true,
  },

  "professionals-consultants": {
    title: "Select consulting areas",
    clientTitle: "What do you need consulting on?",
    hint: "Pick at least one — these show as tags on your card and let people filter for you.",
    options: [
      "Business strategy",
      "IT & software",
      "HR & recruitment",
      "Marketing & branding",
      "Finance & accounting",
      "Operations & supply chain",
      "Legal & compliance",
      "Immigration & relocation",
      "Startup & fundraising",
      "Data & analytics",
    ],
    certifications: {
      title: "Certifications",
      options: [
        "MBA",
        "PMP",
        "Six Sigma (Green Belt)",
        "Six Sigma (Black Belt)",
        "Certified Scrum Master",
        "ITIL",
        "CPA",
      ],
    },
    fee: {
      label: "Pricing model",
      hint: "How you charge clients",
      options: [
        "Hourly rate",
        "Per project",
        "Monthly retainer",
        "Success / commission based",
        "Free first consultation",
      ],
    },
    experience: true,
  },

  "professionals-insurance-agents": {
    title: "Select insurance types",
    clientTitle: "Which insurance do you need?",
    hint: "Pick at least one — these show as tags on your card and let people filter for you.",
    options: [
      "Life insurance",
      "Health insurance",
      "Auto insurance",
      "Home / property insurance",
      "Business / commercial insurance",
      "Travel insurance",
      "Disability insurance",
      "Dental & vision",
      "Medicare plans",
      "Umbrella policies",
    ],
    certifications: {
      title: "Licences & designations",
      options: [
        "Licensed insurance producer",
        "CLU (Chartered Life Underwriter)",
        "ChFC (Chartered Financial Consultant)",
        "CPCU",
        "LUTCF",
      ],
    },
    license: {
      label: "Insurance licence number",
      hint: "Required — shown on your public card",
      required: true,
    },
    carriers: {
      label: "Carrier companies",
      hint: "Comma separated, e.g. State Farm, Aetna, Progressive",
    },
    experience: true,
  },

  "professionals-financial-advisors": {
    title: "Select advisory services",
    clientTitle: "What financial help do you need?",
    hint: "Pick at least one — these show as tags on your card and let people filter for you.",
    options: [
      "Investment planning",
      "Retirement planning",
      "Tax planning",
      "Estate planning",
      "Insurance planning",
      "College savings (529)",
      "Debt management",
      "Business / succession planning",
      "Wealth management",
      "NRI & cross-border planning",
    ],
    certifications: {
      title: "Licences & designations",
      options: [
        "FINRA Series 7",
        "FINRA Series 63",
        "FINRA Series 65",
        "FINRA Series 66",
        "CFP (Certified Financial Planner)",
        "CFA (Chartered Financial Analyst)",
        "CPA",
        "ChFC",
        "Registered Investment Adviser (RIA)",
      ],
    },
    license: {
      label: "CRD / firm registration number",
      hint: "Shown on your public card so clients can look you up",
      required: false,
    },
    fee: {
      label: "Fee structure",
      hint: "How you are paid",
      options: [
        "Fee-only",
        "Fee-based",
        "Commission",
        "Hourly",
        "Flat fee / per plan",
        "Percentage of assets",
      ],
    },
    experience: true,
  },
  /** Every IT training subcategory shares one set: courses, visa and career support. */
  "education-it-training-and-career-services": IT_TRAINING_SET,
  "it-training": IT_TRAINING_SET,
  "it-training-it-training-institutes": IT_TRAINING_SET,
  "it-training-online-bootcamps": IT_TRAINING_SET,
  "it-training-opt-cpt-training": IT_TRAINING_SET,
  "it-training-h1b-and-visa-support": IT_TRAINING_SET,
  "it-training-corporate-training": IT_TRAINING_SET,
  "it-training-interview-and-resume-prep": IT_TRAINING_SET,
  "it-training-placement-assistance": IT_TRAINING_SET,
  "it-training-staffing-and-consulting": IT_TRAINING_SET,
};

/** Real estate agents share the engine; brokerage, MLS and sales live on /dashboard/agent. */
const AGENT_SET: SpecialtySet = {
  title: "Select what you handle",
  clientTitle: "What do you want the professional to handle?",
  hint: "Pick at least one — these show as tags on your card and let people filter for you.",
  options: [
    "Buyer Agent",
    "Seller Agent",
    "Rental Specialist",
    "Commercial Real Estate",
    "Investment Properties",
    "Luxury Homes",
    "First-time Buyers",
    "Property Management",
    "Property Photography",
    "Videography & Drone Shoots",
    "3D Virtual Tours / 3D Maps",
    "2D Floor Plans",
    "Home Staging",
    "Property Valuation",
  ],
  certifications: {
    title: "Certifications & memberships",
    options: [
      "Realtor® (NAR Member)",
      "CRS (Certified Residential Specialist)",
      "ABR (Accredited Buyer's Representative)",
      "CCIM (Commercial)",
      "SRES (Seniors Real Estate Specialist)",
    ],
  },
  license: {
    label: "Real estate licence number",
    hint: "Required — shown on your public card",
    required: true,
  },
  experience: true,
};

SPECIALTY_SETS["real-estate-property-dealers"] = AGENT_SET;
SPECIALTY_SETS["professionals-realtors"] = AGENT_SET;

/** Shared shape for the business-services trades: what you do, how and for whom. */
function businessSet({
  hint,
  options,
  extra = [],
}: {
  hint: string;
  options: string[];
  extra?: ChoiceGroup[];
}): SpecialtySet {
  return {
    title: "Select what you offer",
    clientTitle: "What do you need help with?",
    hint,
    options,
    choices: [
      ...extra,
      {
        key: "mode",
        title: "How do you work?",
        clientTitle: "How do you want to work with them?",
        options: ["Remote / online", "At your office", "At our office", "Hybrid"],
        mode: "multi",
      },
      {
        key: "clients",
        title: "Who you work with",
        clientTitle: "This is for",
        options: [
          "Individuals",
          "Startups",
          "Small businesses",
          "Mid-size companies",
          "Enterprises",
          "Non-profits",
        ],
        mode: "multi",
      },
    ],
    pricing: [
      { key: "priceFrom", label: "Starting price", hint: "Smallest job you take on" },
      { key: "priceHourly", label: "Hourly rate", hint: "Optional" },
    ],
    availability: { label: "Working hours", hint: "e.g. Mon–Sat 9am–7pm, same-day replies" },
    experience: true,
  };
}

SPECIALTY_SETS["business-services-chartered-accountants"] = businessSet({
  hint: "Pick everything you handle — these become tags on your card and filters for clients.",
  options: [
    "Individual tax returns",
    "Business tax returns",
    "Bookkeeping",
    "Payroll",
    "Company formation",
    "Audit & assurance",
    "GST / VAT / sales tax filing",
    "ITIN & tax ID help",
    "FBAR / foreign income",
    "Tax planning",
    "IRS / notice representation",
    "CFO / advisory services",
    "QuickBooks / Xero setup",
    "Non-profit accounting",
  ],
  extra: [
    {
      key: "software",
      title: "Software you work in",
      clientTitle: "Software you use",
      options: ["QuickBooks", "Xero", "Tally", "Zoho Books", "Sage", "NetSuite"],
      mode: "multi",
    },
  ],
});

SPECIALTY_SETS["business-services-gst-and-tax-consultants"] =
  SPECIALTY_SETS["business-services-chartered-accountants"];

/** Legal and insurance already have full sets under Professionals — reuse them. */
SPECIALTY_SETS["business-services-lawyers-and-legal"] =
  SPECIALTY_SETS["professionals-attorneys"];
SPECIALTY_SETS["business-services-insurance-agents"] =
  SPECIALTY_SETS["professionals-insurance-agents"];

SPECIALTY_SETS["business-services-printing-and-signage"] = businessSet({
  hint: "Pick everything you print or fabricate.",
  options: [
    "Business cards",
    "Flyers & brochures",
    "Banners & backdrops",
    "Yard & lawn signs",
    "Vehicle wraps",
    "Shop signage & light boxes",
    "Wedding invitations",
    "Stickers & labels",
    "T-shirts & apparel printing",
    "Mugs & gifting",
    "Large format / posters",
    "Menus & packaging",
    "Design services",
    "Same-day printing",
  ],
});

SPECIALTY_SETS["business-services-web-and-app-development"] = businessSet({
  hint: "Pick the work you take on — clients filter by these.",
  options: [
    "Website design",
    "WordPress",
    "Shopify / e-commerce",
    "Custom web apps",
    "Mobile apps (iOS / Android)",
    "React / Next.js",
    "Node.js / backend APIs",
    "PHP / Laravel",
    "Python / Django",
    "AI & chatbot integration",
    "Website maintenance",
    "Hosting & migration",
    "Website speed & SEO fixes",
    "Payment gateway integration",
    "CRM & ERP integration",
    "UI / UX design",
    "Booking & appointment systems",
    "Landing pages",
  ],
  extra: [
    {
      key: "engagement",
      title: "Engagement type",
      clientTitle: "How you want to hire",
      options: ["Fixed price project", "Hourly", "Monthly retainer", "Dedicated team"],
      mode: "multi",
    },
  ],
});

SPECIALTY_SETS["business-services-digital-marketing"] = businessSet({
  hint: "Pick the channels you run for clients.",
  options: [
    "SEO",
    "Local SEO & Google Business Profile",
    "Google Ads",
    "Meta ads (Facebook / Instagram)",
    "Social media management",
    "Content writing",
    "Email marketing",
    "WhatsApp marketing",
    "Influencer marketing",
    "Video & reels production",
    "Graphic design",
    "Branding & logo design",
    "Website analytics & tracking",
    "Lead generation",
    "Amazon / marketplace listings",
    "YouTube channel growth",
  ],
});

SPECIALTY_SETS["business-services-courier-and-logistics"] = businessSet({
  hint: "Pick what you move and where.",
  options: [
    "Local courier",
    "Same-day delivery",
    "Domestic parcels",
    "International shipping",
    "Air freight",
    "Sea freight",
    "Document shipping",
    "Food & groceries delivery",
    "Furniture & bulky items",
    "Cold chain",
    "Warehousing",
    "Customs clearance",
    "Packers & movers",
    "Pharmacy & medical shipments",
  ],
});

SPECIALTY_SETS["business-services-staffing-and-hr"] = businessSet({
  hint: "Pick the hiring and HR work you handle.",
  options: [
    "Permanent hiring",
    "Contract / C2C staffing",
    "Contract-to-hire",
    "IT recruitment",
    "Healthcare recruitment",
    "Hospitality & retail staffing",
    "Executive search",
    "Payroll services",
    "HR compliance",
    "Background verification",
    "Visa & immigration support",
    "Employee handbook & policies",
    "Training & onboarding",
    "Offshore / global teams",
  ],
});

/**
 * Wedding and event trades. A desi wedding vendor is booked for a specific
 * ritual — sangeet mehndi, baraat dhol, mandap decor — so each trade carries
 * its own service list, plus the questions every couple asks: which events you
 * cover, whether you travel, and how far ahead you take bookings.
 */
function weddingSet({
  title,
  hint,
  options,
  extra = [],
  priceLabel = "Starting package price",
}: {
  title: string;
  hint: string;
  options: string[];
  extra?: ChoiceGroup[];
  priceLabel?: string;
}): SpecialtySet {
  return {
    title,
    clientTitle: "What do you need?",
    hint,
    options,
    customOption: {
      label: "Something else you offer",
      hint: "Comma-separated, e.g. Haldi stage decor",
    },
    choices: [
      ...extra,
      {
        key: "functions",
        title: "Functions you cover",
        clientTitle: "Which function is this for?",
        options: [
          "Engagement / roka",
          "Mehndi",
          "Sangeet",
          "Haldi / pithi",
          "Baraat",
          "Wedding day",
          "Reception",
          "Nikah / walima",
          "Anand Karaj",
          "Christian wedding",
          "Griha pravesh / housewarming",
          "Birthday & anniversary",
          "Baby shower / naming",
          "Corporate & community event",
        ],
        mode: "multi",
      },
      {
        key: "travel",
        title: "Where you work",
        clientTitle: "Where is the function?",
        options: [
          "At the venue",
          "At the client's home",
          "At our studio / hall",
          "Travel within the metro",
          "Travel across the state",
          "Travel nationwide",
          "Destination weddings abroad",
        ],
        mode: "multi",
      },
      {
        key: "languages",
        title: "Languages you work in",
        clientTitle: "Language you prefer",
        options: [
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
          "Sanskrit",
          "Urdu",
          "Nepali",
        ],
        mode: "multi",
      },
    ],
    pricing: [
      { key: "priceFrom", label: priceLabel, hint: "Smallest booking you take" },
      { key: "priceHourly", label: "Hourly rate", hint: "Optional" },
    ],
    availability: {
      label: "Booking notice & days",
      hint: "e.g. weekends, 2 weeks' notice, peak season Sep–Jan",
    },
    experience: true,
  };
}

/**
 * Photography is the broadest wedding trade: the same studio shoots the baraat,
 * the baby's annaprashan and a corporate headshot, so the shoot list is long
 * enough to need searchable tabs.
 */
const PHOTO_TABS: OptionTab[] = [
  {
    title: "Wedding & engagement",
    options: [
      "Wedding day photography",
      "Candid photography",
      "Traditional photography",
      "Cinematic photography",
      "Engagement / roka shoot",
      "Pre-wedding shoot",
      "Post-wedding shoot",
      "Save-the-date shoot",
      "Bridal portraits",
      "Mehndi & sangeet coverage",
      "Haldi coverage",
      "Baraat coverage",
      "Reception coverage",
      "Nikah / walima coverage",
      "Anand Karaj coverage",
      "Destination wedding coverage",
      "Two-photographer team",
      "Photo booth",
    ],
  },
  {
    title: "Family & milestones",
    options: [
      "Maternity shoot",
      "Baby shower shoot",
      "Newborn shoot",
      "Annaprashan / first-rice ceremony",
      "Naming & cradle ceremony",
      "Mundan & first birthday",
      "Birthday party shoot",
      "Family shoot",
      "Kids & school shoot",
      "Anniversary shoot",
      "Graduation shoot",
      "Prom shoot",
      "Griha pravesh / housewarming",
      "Religious & temple event coverage",
      "Community & cultural event coverage",
    ],
  },
  {
    title: "Video & drone",
    options: [
      "Wedding videography",
      "Cinematography",
      "Highlight film",
      "Teaser / trailer",
      "Event videography",
      "Drone / aerial photography",
      "Drone / aerial video",
      "Live streaming",
      "Motion / action photography",
      "Same-day edit screening",
    ],
  },
  {
    title: "Studio & portrait",
    options: [
      "Studio photography",
      "Portrait photography",
      "Headshot photography",
      "Portfolio & modelling shoot",
      "Boudoir photography",
      "Passport & visa photos",
      "Retouching & restoration",
    ],
  },
  {
    title: "Business & other",
    options: [
      "Corporate & conference coverage",
      "Commercial photography",
      "Product photography",
      "Food photography",
      "Fashion & jewellery photography",
      "Real estate photography",
      "Architecture & interiors",
      "Pet photography",
      "Landscape photography",
      "Nature & wildlife photography",
      "Travel photography",
      "Sports photography",
      "Freelance / hourly hire",
    ],
  },
];

const PHOTO_OPTIONS = PHOTO_TABS.flatMap((tab) => tab.options);

/**
 * A desi DJ is usually an entertainment company: the same booking brings the
 * decks, a dhol player, an emcee and a live singer, so the list covers the acts
 * as well as the music.
 */
const DJ_TABS: OptionTab[] = [
  {
    title: "DJ services",
    options: [
      "Wedding DJ",
      "Sangeet DJ",
      "Reception DJ",
      "Baraat DJ",
      "Garba & dandiya DJ",
      "Party DJ",
      "Event & corporate DJ",
      "Sweet sixteen DJ",
      "Mobile DJ (we travel)",
      "Club & lounge DJ",
      "Open-format DJ",
      "Female DJ",
      "Video / visual DJ",
    ],
  },
  {
    title: "Music you play",
    options: [
      "Bollywood",
      "Punjabi & bhangra",
      "Tamil",
      "Telugu",
      "Malayalam",
      "Kannada",
      "Gujarati & garba",
      "Marathi & lavani",
      "Bengali",
      "Nepali",
      "Pakistani & Urdu",
      "Old Hindi classics",
      "Devotional & bhajan",
      "Ghazal & sufi",
      "Hip-hop & rap",
      "Top 40 & pop",
      "House & EDM",
      "Reggaeton & Latin",
      "Afrobeats & soca",
      "Country",
      "Jazz & lounge",
    ],
  },
  {
    title: "Live acts",
    options: [
      "Dhol player",
      "Live percussion with the DJ",
      "Live band",
      "Indian band / orchestra",
      "Live singer",
      "Wedding singer",
      "Ghazal singer",
      "Karaoke singer",
      "Bhangra dancers",
      "Garba & folk dancers",
      "Bollywood dance troupe",
      "Shehnai & nadaswaram",
      "Dholki & ladies sangeet music",
      "Classical / instrumental ensemble",
      "Mariachi band",
    ],
  },
  {
    title: "Hosting & shows",
    options: [
      "MC / master of ceremonies",
      "Anchor & host",
      "Comedian",
      "Magician",
      "Dance choreography for the family",
      "Games & audience engagement",
      "Fireworks & pyro show",
      "Laser show",
      "Balloon & decor entertainment",
      "Kids' entertainer",
    ],
  },
];

const DJ_OPTIONS = DJ_TABS.flatMap((tab) => tab.options);

/**
 * A priest is booked for one named ritual, so the list is the ritual itself —
 * from a naming ceremony to asthi visarjan — rather than a vague "puja".
 */
const PRIEST_TABS: OptionTab[] = [
  {
    title: "Weddings & engagements",
    options: [
      "Hindu wedding (vivah)",
      "Vedic wedding with full rituals",
      "South Indian wedding",
      "Gujarati wedding",
      "Marathi wedding",
      "Bengali wedding",
      "Punjabi wedding",
      "Anand Karaj (Sikh ceremony)",
      "Nikah",
      "Jain wedding",
      "Buddhist wedding",
      "Interfaith ceremony",
      "Christian wedding officiant",
      "Court / civil ceremony officiant",
      "Destination wedding ceremony",
      "Engagement / roka / sagai",
      "Sagan & tilak",
      "Haldi & mehndi rituals",
      "Ganesh puja before the wedding",
      "Mandap muhurat & ghar puja",
      "Vratam & Gauri puja",
      "Reception blessing",
      "Wedding anniversary vow renewal",
    ],
  },
  {
    title: "Baby & child ceremonies",
    options: [
      "Baby shower / seemantham / godh bharai",
      "Punsavan & garbhadhan",
      "Namkaran (naming)",
      "Cradle ceremony",
      "Annaprashan (first food)",
      "Mundan / chudakarana (tonsure)",
      "First birthday & ayush homam",
      "Vidyarambham / aksharabhyasam",
      "Upanayanam / janeu (thread ceremony)",
      "Ritu kala / half-saree function",
      "Karnavedha (ear piercing)",
    ],
  },
  {
    title: "Home, business & vehicle",
    options: [
      "Griha pravesh / housewarming",
      "Vastu shanti puja",
      "Rakshoghna homam",
      "Bhoomi puja / ground breaking",
      "New office & shop opening puja",
      "Business & Lakshmi prosperity puja",
      "Vahan puja (new vehicle)",
      "Kitchen & first cooking ritual",
      "Well / borewell & water puja",
      "Vastu consultation & guidance",
    ],
  },
  {
    title: "Pujas, havan & graha shanti",
    options: [
      "Satyanarayan puja & katha",
      "Ganesh puja",
      "Lakshmi puja",
      "Saraswati puja",
      "Durga & Navratri puja",
      "Rudrabhishek",
      "Maha Mrityunjaya jaap",
      "Sudarshana homam",
      "Chandi & Devi homam",
      "Navagraha shanti",
      "Mangal dosha & kuja shanti",
      "Shani shanti & Rahu-Ketu puja",
      "Nakshatra & birth star shanti",
      "Kaal sarp dosha puja",
      "Ayushya homam & health puja",
      "Sathabhishekam & shastipoorthi (60th)",
      "Havan / yagya of your choice",
      "Sundarkand & Hanuman Chalisa paath",
      "Sanskrit mantra chanting & jaap",
    ],
  },
  {
    title: "Festivals & katha",
    options: [
      "Diwali Lakshmi puja",
      "Ganesh Chaturthi",
      "Navratri & Garba puja",
      "Durga puja",
      "Janmashtami",
      "Ram Navami",
      "Maha Shivratri",
      "Karva Chauth & Vat Savitri",
      "Raksha Bandhan & Bhai Dooj",
      "Makar Sankranti & Pongal",
      "Onam & Vishu",
      "Ugadi & Gudi Padwa",
      "Chhath puja",
      "Akhand Ramayan paath",
      "Bhagwat katha & pravachan",
      "Bhajan sandhya & kirtan",
      "Sikh Akhand Paath & Sukhmani Sahib",
      "Temple & community festival puja",
    ],
  },
  {
    title: "Last rites & ancestral",
    options: [
      "Antim sanskar / funeral rites",
      "Cremation ceremony",
      "Asthi visarjan (ash immersion)",
      "Terahvi & 13th-day ceremony",
      "Shraddh & pind daan",
      "Pitra dosha & tarpan",
      "Pitru paksha rituals",
      "Death anniversary (barsi)",
      "Prayer meeting & shanti path",
      "Garuda Purana paath",
    ],
  },
  {
    title: "Dates & guidance",
    options: [
      "Muhurat (auspicious date) selection",
      "Kundli / horoscope matching",
      "Birth chart reading",
      "Panchang & festival calendar guidance",
      "Naming suggestions from the birth star",
      "Remedies & upay guidance",
      "Spiritual counselling",
      "Explaining each ritual to the family",
      "Teaching mantras & shlokas",
    ],
  },
];

const PRIEST_OPTIONS = PRIEST_TABS.flatMap((tab) => tab.options);

const WEDDING_SETS: Record<string, SpecialtySet> = {
  "Mehndi Artists": weddingSet({
    title: "Select the mehndi work you do",
    hint: "Pick every design and package you offer — couples filter by these.",
    options: [
      "Bridal mehndi (full hands & feet)",
      "Groom mehndi",
      "Guest / family mehndi",
      "Traditional Indian design",
      "Rajasthani design",
      "Marwari design",
      "Gujarati design",
      "Arabic design",
      "Moroccan design",
      "Indo-Arabic fusion",
      "Minimal / modern design",
      "Portrait & story mehndi",
      "Jewellery-style mehndi",
      "Mandala design",
      "Glitter & stone work",
      "White henna body art",
      "Coloured / pastel henna",
      "Organic & chemical-free henna",
      "Jagua (natural black) henna",
      "Temporary tattoos",
      "Kids' mehndi",
      "Baby shower mehndi",
      "Karva Chauth & festival mehndi",
      "Mehndi party / bulk booking",
      "Home service",
      "Same-day booking",
      "Nail art add-on",
    ],
    priceLabel: "Starting price (bridal)",
  }),

  "Makeup Artists": weddingSet({
    title: "Select the makeup you do",
    hint: "Pick every look and add-on you offer.",
    options: [
      "Bridal makeup",
      "Engagement / reception makeup",
      "Mehndi & sangeet makeup",
      "Guest & family makeup",
      "HD makeup",
      "Airbrush makeup",
      "Waterproof makeup",
      "Party & photoshoot makeup",
      "South Indian bridal look",
      "North Indian bridal look",
      "Muslim / nikah bridal look",
      "Christian bridal look",
      "Draping (saree / lehenga)",
      "Hairstyling & updos",
      "Hair extensions",
      "Wigs & hairpieces",
      "Saree draping",
      "Dupatta & veil setting",
      "Eyelash extensions",
      "Threading & waxing",
      "Facial & pre-bridal skin prep",
      "Pre-bridal package",
      "Trial session",
      "Groom grooming",
      "Home / venue service",
      "Own kit & assistants",
    ],
    priceLabel: "Starting price (bridal look)",
  }),

  Photographers: {
    ...weddingSet({
      title: "Select the photography you do",
      hint: "Pick every shoot you take on — couples and families filter by these.",
      options: PHOTO_OPTIONS,
      extra: [
        {
          key: "deliverables",
          title: "Prints, albums and extras you deliver",
          clientTitle: "What do you want delivered?",
          options: [
            "Edited digital photos",
            "Online gallery",
            "USB / cloud handover",
            "Raw files on request",
            "Same-day edits",
            "Printed album",
            "Flush mount album",
            "Photo book",
            "Guest signing photo book",
            "Photo printing",
            "Canvas print",
            "Metallic & acrylic print",
            "Framed enlargement",
            "Banners & posters",
            "Save-the-date & invitation design",
            "Photo booth prints",
            "Reels & social cuts",
            "Video projection at the venue",
            "Live streaming for family abroad",
            "Second photographer",
            "Retouching & album proofing",
          ],
          mode: "multi",
        },
        {
          key: "distance",
          title: "How far you travel",
          clientTitle: "How far should they travel?",
          options: [
            "Up to 10 miles",
            "Up to 25 miles",
            "Up to 50 miles",
            "More than 50 miles",
            "Anywhere in the country",
            "Destination shoots abroad",
          ],
          mode: "single",
        },
        {
          key: "payments",
          title: "Payments you accept",
          options: [
            "Cash",
            "Zelle",
            "Venmo",
            "PayPal",
            "Cash App",
            "Check",
            "Bank transfer",
            "Visa / Mastercard",
            "American Express",
            "UPI",
            "Deposit to hold the date",
            "Instalments",
          ],
          mode: "multi",
        },
      ],
      priceLabel: "Starting package price",
    }),
    optionTabs: PHOTO_TABS,
  },

  Videographers: weddingSet({
    title: "Select the video work you do",
    hint: "Pick every format you shoot and deliver.",
    options: [
      "Wedding film",
      "Cinematic highlight film",
      "Traditional full-length video",
      "Teaser / trailer",
      "Pre-wedding film",
      "Save-the-date film",
      "Drone / aerial video",
      "Multi-camera coverage",
      "Live streaming to family abroad",
      "LED screen & live mixing",
      "Same-day edit screening",
      "4K / cinema camera",
      "Reels & social cuts",
      "Instagram teaser",
      "Voice-over & subtitles",
      "Background score licensing",
      "Raw footage handover",
      "USB / cloud delivery",
    ],
  }),

  "Wedding Planners": weddingSet({
    title: "Select the planning you handle",
    hint: "Pick everything you take off the couple's hands.",
    options: [
      "Full wedding planning",
      "Partial planning",
      "Day-of coordination",
      "Venue sourcing",
      "Vendor management",
      "Budget planning",
      "Theme & design concept",
      "Decor styling",
      "Guest list & RSVP management",
      "Invitation management",
      "Guest hospitality & hotel blocks",
      "Airport pick-up & logistics",
      "Multi-day itinerary",
      "Sangeet & choreography coordination",
      "Destination weddings",
      "Permits & venue paperwork",
      "Catering coordination",
      "Entertainment booking",
      "Return gifts & hampers",
      "On-site staff & crew",
      "Rehearsal management",
      "Post-wedding wrap-up",
    ],
    priceLabel: "Planning fee from",
  }),

  "Decorators & Florists": weddingSet({
    title: "Select the decor you do",
    hint: "Pick every setup you build — couples search by these.",
    options: [
      "Mandap decor",
      "Stage & backdrop decor",
      "Entrance & gate decor",
      "Aisle & walkway decor",
      "Floral arrangements",
      "Fresh flower jaimala / garlands",
      "Artificial flower setups",
      "Marigold & traditional decor",
      "Balloon decor",
      "Drapes & fabric ceilings",
      "Lighting & uplighters",
      "Chandeliers",
      "Table centrepieces",
      "Chair covers & linens",
      "Mehndi & sangeet decor",
      "Haldi decor",
      "Baraat & car decor",
      "Cake & dessert table styling",
      "Photo booth & selfie corner",
      "Signage & name boards",
      "Reception lounge setup",
      "Ganesh / puja setup",
      "Theme decor (royal, boho, floral)",
      "Tent & canopy",
      "Fog, sparkler & special effects",
      "Same-day teardown",
    ],
  }),

  "DJ & Sound": {
    ...weddingSet({
      title: "Select the entertainment you provide",
      hint: "Pick every set, act and rig you bring — clients filter by these.",
      options: DJ_OPTIONS,
      extra: [
        {
          key: "events",
          title: "Events you play",
          clientTitle: "What is the event?",
          options: [
            "Wedding ceremony",
            "Sangeet",
            "Mehndi",
            "Garba & dandiya night",
            "Baraat",
            "Reception",
            "Engagement",
            "Birthday party",
            "Sweet sixteen",
            "Baby shower & naming",
            "Anniversary",
            "House warming / griha pravesh",
            "Retirement & farewell",
            "Corporate event & conference",
            "Holiday & festival party",
            "Theme party",
            "Fundraiser & community show",
            "College & campus event",
            "Karaoke party",
            "Bhajan sandhya / musical evening",
          ],
          mode: "multi",
        },
        {
          key: "rig",
          title: "Sound, lighting and extras you bring",
          clientTitle: "What should they bring?",
          options: [
            "Sound system for up to 100 guests",
            "Sound system for 100–300 guests",
            "Sound system for 300+ guests",
            "Wireless mics for speeches",
            "Podium & PA for the ceremony",
            "Baraat portable trolley sound",
            "Uplighting",
            "Dance floor lighting",
            "Intelligent / moving-head lights",
            "Laser & effect lighting",
            "LED wall or screen",
            "HD projector & screen",
            "Fog & dry ice",
            "Cold sparklers",
            "CO2 jets & confetti",
            "Photo booth",
            "Karaoke setup",
            "Games for kids & adults",
            "Generator / outdoor power",
            "Backup gear on site",
            "Setup and teardown included",
          ],
          mode: "multi",
        },
        {
          key: "payments",
          title: "Payments you accept",
          options: [
            "Cash",
            "Zelle",
            "Venmo",
            "PayPal",
            "Cash App",
            "Check",
            "Bank transfer",
            "Visa / Mastercard",
            "American Express",
            "UPI",
            "Deposit to hold the date",
            "Instalments",
          ],
          mode: "multi",
        },
      ],
      priceLabel: "Starting price (per event)",
    }),
    optionTabs: DJ_TABS,
  },

  Caterers: weddingSet({
    title: "Select the catering you do",
    hint: "Pick every cuisine and service style you offer.",
    options: [
      "North Indian",
      "South Indian",
      "Gujarati",
      "Punjabi",
      "Rajasthani",
      "Bengali",
      "Maharashtrian",
      "Hyderabadi & biryani",
      "Chettinad",
      "Kerala / Sadhya",
      "Indo-Chinese",
      "Mughlai & kebabs",
      "Jain (no onion / garlic)",
      "Pure vegetarian kitchen",
      "Halal",
      "Vegan options",
      "Gluten-free options",
      "Live counters & chaat",
      "Dosa & tiffin counter",
      "Paan & dessert counter",
      "Buffet service",
      "Plated / sit-down service",
      "Thali service",
      "Banana leaf service",
      "Cocktail & appetiser service",
      "Bar & mocktail service",
      "Sangeet & mehndi menus",
      "Breakfast & tea catering",
      "Boxed meals & tiffin",
      "Crockery, staff & servers",
      "Tasting session",
      "Full venue kitchen setup",
    ],
    priceLabel: "Price per plate from",
  }),

  "Banquet Halls & Venues": weddingSet({
    title: "Select what the venue offers",
    hint: "Pick everything included so couples can filter for it.",
    options: [
      "Banquet hall",
      "Outdoor lawn",
      "Rooftop venue",
      "Poolside venue",
      "Farmhouse",
      "Hotel ballroom",
      "Community hall",
      "Temple hall",
      "Gurudwara hall",
      "Church hall",
      "Convention centre",
      "In-house catering",
      "Outside catering allowed",
      "Vegetarian-only kitchen",
      "Alcohol permitted",
      "Bring your own alcohol",
      "In-house decor",
      "Outside decor allowed",
      "Mandap allowed",
      "Open fire / havan allowed",
      "Bridal changing room",
      "Valet parking",
      "Free parking",
      "Wheelchair access",
      "Stage & sound included",
      "Projector & screens",
      "Guest rooms on site",
      "Multi-day booking",
      "Same-venue mehndi & sangeet",
    ],
    priceLabel: "Hall rental from",
  }),

  Pandits: {
    ...weddingSet({
      title: "Select the ceremonies you perform",
      hint: "Pick every puja and ritual by name — families search for the exact one.",
      options: PRIEST_OPTIONS,
      extra: [
        {
          key: "traditions",
          title: "Traditions and vidhis you follow",
          clientTitle: "Which tradition should the ceremony follow?",
          options: [
            "North Indian / Vedic",
            "South Indian / Dravidian",
            "Telugu",
            "Tamil",
            "Kannada",
            "Malayali",
            "Gujarati",
            "Marathi",
            "Bengali",
            "Punjabi / Hindu",
            "Sikh (Granthi / path)",
            "Jain",
            "Buddhist",
            "Muslim (Nikah)",
            "Christian",
            "Arya Samaj",
            "ISKCON / Vaishnav",
            "Swaminarayan",
            "Shaiva & Shakta",
            "Interfaith & mixed families",
          ],
          mode: "multi",
        },
        {
          key: "arrangements",
          title: "What you bring and how you serve",
          clientTitle: "How should it be arranged?",
          options: [
            "Samagri (puja items) provided",
            "Samagri list sent in advance",
            "Havan kund & fire setup",
            "Idols, photos & altar setup",
            "Mandap / small stage setup",
            "Flowers, fruit & prasad arranged",
            "Priest's own mic & speaker",
            "Ceremony at your home",
            "Ceremony at a temple",
            "Ceremony at a banquet hall or venue",
            "Outdoor & beach ceremony",
            "Ceremony at the crematorium",
            "Destination ceremony (we travel)",
            "Online / video ceremony",
            "Ceremony explained in English as it goes",
            "Printed vows & shlokas for the family",
            "Marriage licence signing / registered officiant",
            "Two priests for a large ceremony",
            "Bhajan singers or musicians arranged",
          ],
          mode: "multi",
        },
        {
          key: "distance",
          title: "How far you travel",
          clientTitle: "How far should they travel?",
          options: [
            "Up to 10 miles",
            "Up to 25 miles",
            "Up to 50 miles",
            "More than 50 miles",
            "Anywhere in the country",
            "Overseas / destination ceremonies",
          ],
          mode: "single",
        },
        {
          key: "payments",
          title: "Payments you accept",
          options: [
            "Cash",
            "Zelle",
            "Venmo",
            "PayPal",
            "Cash App",
            "Check",
            "Bank transfer",
            "Visa / Mastercard",
            "American Express",
            "Debit card",
            "UPI",
            "Whatever the family offers as dakshina",
          ],
          mode: "multi",
        },
      ],
      priceLabel: "Dakshina / fee from",
    }),
    optionTabs: PRIEST_TABS,
  },

  "Bridal Wear": weddingSet({
    title: "Select what you sell or rent",
    hint: "Pick every outfit and service you offer.",
    options: [
      "Bridal lehenga",
      "Wedding saree",
      "Kanjeevaram & silk sarees",
      "Banarasi sarees",
      "Reception gowns",
      "Anarkali & sharara",
      "Salwar suits",
      "Nikah & walima outfits",
      "Sangeet & mehndi outfits",
      "Bridesmaid outfits",
      "Kids' ethnic wear",
      "Custom stitching",
      "Alterations & fitting",
      "Rental outfits",
      "Designer collections",
      "Imported / India-sourced",
      "Dupatta & veil",
      "Bridal jewellery",
      "Footwear & clutches",
      "Trousseau packing",
      "Appointment-only styling",
      "Shipping across the US",
    ],
    priceLabel: "Outfits from",
  }),
};

/** Trades that share a set with a sibling — the work and the questions are the same. */
const WEDDING_ALIASES: Record<string, string> = {
  "Hair Stylists": "Makeup Artists",
  "Saree Draping & Pagri Tying": "Makeup Artists",
  "Pre-Wedding Shoots": "Photographers",
  "Drone Photography": "Photographers",
  "Photo Booths": "Photographers",
  "Live Streaming": "Videographers",
  "Wedding Coordinators": "Wedding Planners",
  "Destination Weddings": "Wedding Planners",
  "Floral Designers": "Decorators & Florists",
  "Mandap Setup": "Decorators & Florists",
  "Tent & Lighting": "Decorators & Florists",
  "Event Rentals & Supplies": "Decorators & Florists",
  "Stage & Sound Rentals": "DJ & Sound",
  "Live Bands": "DJ & Sound",
  "Dhol & Baraat": "DJ & Sound",
  "Anchors & Artists": "DJ & Sound",
  "Dance Choreographers": "DJ & Sound",
  "Regional Cuisine Catering": "Caterers",
  "Dessert & Cake Vendors": "Caterers",
  "Wedding Cakes": "Caterers",
  "Bartending & Bar Service": "Caterers",
  Hotels: "Banquet Halls & Venues",
  "Outdoor Venues": "Banquet Halls & Venues",
  "Gurudwara Services": "Pandits",
  "Nikah Services": "Pandits",
  "Church & Interfaith Officiants": "Pandits",
  "Groom Wear": "Bridal Wear",
  Jewellery: "Bridal Wear",
  "Tailoring & Alterations": "Bridal Wear",
};

for (const [name, set] of Object.entries(WEDDING_SETS)) {
  SPECIALTY_SETS[subcategorySlug("events-wedding", name)] = set;
}

for (const [name, source] of Object.entries(WEDDING_ALIASES)) {
  SPECIALTY_SETS[subcategorySlug("events-wedding", name)] = WEDDING_SETS[source];
}

/** A wedding astrologer answers the same questions as one in Professionals. */
SPECIALTY_SETS[
  subcategorySlug("events-wedding", "Astrologers & Horoscope Matching")
] = SPECIALTY_SETS["professionals-astrologers"];
SPECIALTY_SETS[subcategorySlug("religious-services", "Astrologers")] =
  SPECIALTY_SETS["professionals-astrologers"];

/**
 * A priest listed under Religious & Cultural does the same work as a wedding
 * pandit, so the whole ritual list follows him there — a havan specialist and a
 * katha mandali are booked from the same set.
 */
for (const name of [
  "Pandits & Purohits",
  "Havan & Yagya",
  "Last Rites Services",
  "Katha & Bhajan Mandali",
]) {
  SPECIALTY_SETS[subcategorySlug("religious-services", name)] =
    WEDDING_SETS.Pandits;
}

export function specialtySet(subcategorySlug?: string | null): SpecialtySet | null {
  if (!subcategorySlug) return null;
  return SPECIALTY_SETS[subcategorySlug] ?? null;
}

/** Keeps only values the subcategory actually offers, de-duplicated. */
export function cleanSpecialties(
  subcategorySlug: string | null | undefined,
  values: string[],
): string[] {
  const set = specialtySet(subcategorySlug);
  if (!set) return [];
  return set.options.filter((option) => values.includes(option));
}

/**
 * Free-text extras for sets that allow them, e.g. a course we do not list yet.
 * Capped so the tag row on a card stays readable.
 */
export function cleanCustomOptions(
  subcategorySlug: string | null | undefined,
  other: string,
): string[] {
  const set = specialtySet(subcategorySlug);
  if (!set?.customOption) return [];
  const known = new Set(set.options);
  return Array.from(
    new Set(
      other
        .split(",")
        .map((value) => value.trim())
        .filter((value) => value.length > 1 && !known.has(value)),
    ),
  ).slice(0, 10);
}

/** Splits stored values back into listed options and the provider's own extras. */
export function customOptionsOf(
  subcategorySlug: string | null | undefined,
  values: string[],
): string[] {
  const set = specialtySet(subcategorySlug);
  if (!set?.customOption) return [];
  return values.filter((value) => !set.options.includes(value));
}

/** Keeps only offered choice-group values; single-choice groups keep one answer. */
export function cleanServiceOptions(
  subcategorySlug: string | null | undefined,
  values: string[],
): string[] {
  const groups = specialtySet(subcategorySlug)?.choices ?? [];
  return groups.flatMap((group) => {
    const picked = group.options.filter((option) => values.includes(option));
    return group.mode === "single" ? picked.slice(0, 1) : picked;
  });
}

/** Names the groups whose required answer is missing, for a clear error. */
export function missingChoiceGroups(
  subcategorySlug: string | null | undefined,
  values: string[],
): string[] {
  const groups = specialtySet(subcategorySlug)?.choices ?? [];
  return groups
    .filter(
      (group) =>
        group.required && !group.options.some((option) => values.includes(option)),
    )
    .map((group) => group.title);
}

export function disclaimerFor(subcategorySlug?: string | null) {
  return specialtySet(subcategorySlug)?.disclaimer ?? CREDENTIALS_DISCLAIMER;
}

/** Checkbox certifications are validated the same way; extras come from the free-text box. */
export function cleanCertifications(
  subcategorySlug: string | null | undefined,
  values: string[],
  other: string,
): string[] {
  const set = specialtySet(subcategorySlug);
  if (!set?.certifications) return [];
  const known = set.certifications.options.filter((option) => values.includes(option));
  const extras = other
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return [...known, ...extras];
}
