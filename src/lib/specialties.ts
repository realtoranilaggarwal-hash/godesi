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

export type SpecialtySet = {
  title: string;
  hint: string;
  options: string[];
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
