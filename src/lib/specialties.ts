/**
 * Per-subcategory professional profiles. Each set drives three things from one
 * definition: the extra fields on the posting form, the filters on the category
 * page and the tags on the cards — so a tag can never exist that nobody can
 * filter by, and a new profession is one entry away.
 */
/** An extra tick-box or single-choice group, e.g. "Where do you work?". */
export type ChoiceGroup = {
  key: string;
  title: string;
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
      options: ["Online", "Offline (Classroom)", "Hybrid"],
      mode: "multi",
      required: true,
    },
    {
      key: "level",
      title: "Experience level you teach",
      options: ["Beginner", "Intermediate", "Advanced", "Career Switch"],
      mode: "multi",
    },
    {
      key: "highlights",
      title: "Highlights",
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
    hint: "Pick at least one — these show as tags on your card and let people filter for you.",
    options: [
      "Vedic astrology",
      "Tarot reading",
      "Numerology",
      "Palmistry",
      "Vastu consultation",
      "Horoscope / kundli matching",
      "Gemstone consultation",
      "Nadi astrology",
      "Face reading",
      "Muhurat (date selection)",
      "Puja & remedies",
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
  hint: "Pick at least one — these show as tags on your card and let people filter for you.",
  options: [
    "Buyer Agent",
    "Seller Agent",
    "Rental Specialist",
    "Commercial Real Estate",
    "Investment Properties",
    "Luxury Homes",
    "First-time Buyers",
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
