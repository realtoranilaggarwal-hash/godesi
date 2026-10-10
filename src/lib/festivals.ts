import type { Faith } from "@prisma/client";

export type Festival = {
  name: string;
  faith: Faith;
  /** ISO dates, newest last. Lunar festivals move every year, so they are tabulated. */
  dates: string[];
  blurb: string;
  emoji: string;
  /** Event category slug (see eventCategories) whose events belong on this festival's page. */
  genre?: string;
  /** Lower-case words that put an event under this festival when it has no genre. */
  keywords: string[];
  /** Store searches shown as "Shop for …" links (see FestivalShop). */
  shop: { label: string; query: string }[];
};

/**
 * Lunar calendars (Hindu, Islamic, Sikh) cannot be derived from the Gregorian date,
 * so upcoming occurrences are tabulated and the next one is picked at render time.
 */
export const FESTIVALS: Festival[] = [
  {
    name: "Makar Sankranti",
    shop: [
      { label: "Kites & manja", query: "indian kites manja patang" },
      { label: "Til-gud & sweets", query: "til gud chikki" },
      { label: "Pongal pot & kolam", query: "pongal pot kolam rangoli" },
    ],
    genre: "onam-pongal-bihu",
    keywords: ["sankranti", "pongal", "lohri", "uttarayan"],
    faith: "HINDU_TEMPLE",
    emoji: "🪁",
    blurb: "Harvest festival marked with kite flying, til-gud and holy dips.",
    dates: ["2026-01-14", "2027-01-14", "2028-01-14"],
  },
  {
    name: "Maha Shivaratri",
    shop: [
      { label: "Shiva puja items", query: "shivling puja abhishek kit" },
      { label: "Rudraksha malas", query: "rudraksha mala" },
      { label: "Shiva idols & murtis", query: "lord shiva idol" },
    ],
    keywords: ["shivaratri", "shivratri"],
    faith: "HINDU_TEMPLE",
    emoji: "🔱",
    blurb: "Night-long vigil and abhishekam at Shiva temples.",
    dates: ["2026-02-15", "2027-03-06", "2028-02-23"],
  },
  {
    name: "Holi",
    shop: [
      { label: "Organic gulal colours", query: "organic holi colors gulal" },
      { label: "Pichkaris & water guns", query: "holi pichkari" },
      { label: "White kurtas for Holi", query: "white kurta holi" },
    ],
    genre: "holi",
    keywords: ["holi"],
    faith: "HINDU_TEMPLE",
    emoji: "🎨",
    blurb: "Festival of colours; Holika Dahan the previous evening.",
    dates: ["2026-03-04", "2027-03-22", "2028-03-11"],
  },
  {
    name: "Ram Navami",
    shop: [
      { label: "Ram Darbar idols", query: "ram darbar idol" },
      { label: "Puja thali sets", query: "puja thali set" },
      { label: "Ramayan books", query: "ramayan book" },
    ],
    keywords: ["ram navami", "rama navami"],
    faith: "HINDU_TEMPLE",
    emoji: "🏹",
    blurb: "Birth of Lord Rama — bhajans, processions and temple prasad.",
    dates: ["2026-03-27", "2027-04-15", "2028-04-03"],
  },
  {
    name: "Eid al-Fitr",
    shop: [
      { label: "Eid decorations", query: "eid mubarak decorations" },
      { label: "Eid gift boxes", query: "eid gift box" },
      { label: "Kurtas & abayas", query: "eid kurta abaya" },
    ],
    genre: "eid-christmas",
    keywords: ["eid"],
    faith: "MOSQUE",
    emoji: "🌙",
    blurb: "End of Ramadan — Eid namaz, sewaiyan and zakat al-fitr.",
    dates: ["2026-03-20", "2027-03-09", "2028-02-26"],
  },
  {
    name: "Baisakhi",
    shop: [
      { label: "Phulkari dupattas", query: "phulkari dupatta" },
      { label: "Dhol & bhangra wear", query: "dhol bhangra costume" },
      { label: "Sikh gifts", query: "khanda kara sikh gift" },
    ],
    genre: "onam-pongal-bihu",
    keywords: ["baisakhi", "vaisakhi"],
    faith: "GURUDWARA",
    emoji: "🌾",
    blurb: "Khalsa foundation day — nagar kirtan and langar at gurudwaras.",
    dates: ["2026-04-14", "2027-04-14", "2028-04-13"],
  },
  {
    name: "Good Friday",
    shop: [
      { label: "Bibles & devotionals", query: "holy bible devotional" },
      { label: "Crosses & rosaries", query: "rosary cross" },
      { label: "Lenten books", query: "lent devotional book" },
    ],
    keywords: ["good friday"],
    faith: "CHURCH",
    emoji: "✝️",
    blurb: "Passion services and the Way of the Cross.",
    dates: ["2026-04-03", "2027-03-26", "2028-04-14"],
  },
  {
    name: "Easter Sunday",
    shop: [
      { label: "Easter baskets", query: "easter basket" },
      { label: "Easter eggs & decor", query: "easter eggs decorations" },
      { label: "Easter outfits", query: "easter dress outfit" },
    ],
    keywords: ["easter"],
    faith: "CHURCH",
    emoji: "🕊️",
    blurb: "Resurrection Sunday — sunrise services and family lunches.",
    dates: ["2026-04-05", "2027-03-28", "2028-04-16"],
  },
  {
    name: "Mahavir Jayanti",
    shop: [
      { label: "Jain puja items", query: "jain puja samagri" },
      { label: "Mahavir idols", query: "mahavir swami idol" },
      { label: "Jain books", query: "jainism book" },
    ],
    keywords: ["mahavir"],
    faith: "JAIN_TEMPLE",
    emoji: "🪷",
    blurb: "Birth of Bhagwan Mahavir — rath yatra and temple abhishek.",
    dates: ["2026-03-31", "2027-04-18", "2028-04-07"],
  },
  {
    name: "Buddha Purnima",
    shop: [
      { label: "Buddha statues", query: "buddha statue" },
      { label: "Meditation cushions", query: "meditation cushion" },
      { label: "Incense & candles", query: "incense sticks candles" },
    ],
    keywords: ["buddha purnima", "vesak"],
    faith: "BUDDHIST_TEMPLE",
    emoji: "☸️",
    blurb: "Birth, enlightenment and nirvana of the Buddha.",
    dates: ["2026-05-01", "2027-05-20", "2028-05-09"],
  },
  {
    name: "Eid al-Adha",
    shop: [
      { label: "Eid decorations", query: "eid mubarak decorations" },
      { label: "Prayer mats", query: "prayer mat" },
      { label: "Eid gift boxes", query: "eid gift box" },
    ],
    genre: "eid-christmas",
    keywords: ["eid al-adha", "bakrid", "eid"],
    faith: "MOSQUE",
    emoji: "🕌",
    blurb: "Festival of sacrifice, marked with Eid namaz and qurbani.",
    dates: ["2026-05-27", "2027-05-17", "2028-05-05"],
  },
  {
    name: "Rath Yatra",
    shop: [
      { label: "Jagannath idols", query: "jagannath idol" },
      { label: "Puja thali sets", query: "puja thali set" },
      { label: "Rath Yatra decor", query: "rath yatra decoration" },
    ],
    keywords: ["rath yatra", "ratha yatra"],
    faith: "HINDU_TEMPLE",
    emoji: "🛕",
    blurb: "Jagannath chariot procession, celebrated worldwide.",
    dates: ["2026-07-16", "2027-07-05", "2028-06-24"],
  },
  {
    name: "Raksha Bandhan",
    shop: [
      { label: "Rakhis", query: "rakhi for brother" },
      { label: "Rakhi gift hampers", query: "rakhi gift hamper" },
      { label: "Gifts for sisters", query: "gift for sister" },
    ],
    keywords: ["raksha bandhan", "rakhi"],
    faith: "HINDU_TEMPLE",
    emoji: "🧵",
    blurb: "Sisters tie rakhi; temples hold community celebrations.",
    dates: ["2026-08-28", "2027-08-17", "2028-08-05"],
  },
  {
    name: "Janmashtami",
    shop: [
      { label: "Laddu Gopal dress", query: "laddu gopal dress" },
      { label: "Jhula & krishna decor", query: "krishna jhula janmashtami decoration" },
      { label: "Matki & flute", query: "matki krishna flute" },
    ],
    keywords: ["janmashtami", "krishna"],
    faith: "HINDU_TEMPLE",
    emoji: "🪈",
    blurb: "Krishna's birth — midnight aarti, jhanki and dahi handi.",
    dates: ["2026-09-04", "2027-08-25", "2028-09-12"],
  },
  {
    name: "Ganesh Chaturthi",
    shop: [
      { label: "Eco Ganesh idols", query: "eco friendly ganesh idol" },
      { label: "Makhar & mandap decor", query: "ganpati makhar decoration" },
      { label: "Modak moulds", query: "modak mould" },
    ],
    genre: "ganesh-utsav",
    keywords: ["ganesh", "ganapati"],
    faith: "HINDU_TEMPLE",
    emoji: "🐘",
    blurb: "Ten days of Ganpati pandals, modaks and visarjan.",
    dates: ["2026-09-14", "2027-09-04", "2028-08-23"],
  },
  {
    name: "Navratri",
    shop: [
      { label: "Dandiya sticks", query: "dandiya sticks" },
      { label: "Chaniya choli", query: "navratri chaniya choli" },
      { label: "Garba kurtas & kediyu", query: "garba kediyu kurta men" },
    ],
    genre: "garba-dandiya",
    keywords: ["navratri", "garba", "dandiya"],
    faith: "HINDU_TEMPLE",
    emoji: "💃",
    blurb: "Nine nights of Durga puja, garba and dandiya.",
    dates: ["2026-10-11", "2027-09-30", "2028-09-19"],
  },
  {
    name: "Dussehra",
    shop: [
      { label: "Ravan effigies & decor", query: "ravan dussehra decoration" },
      { label: "Puja thali sets", query: "puja thali set" },
      { label: "Ethnic wear", query: "indian ethnic wear kurta" },
    ],
    genre: "durga-puja",
    keywords: ["dussehra", "durga puja", "ramlila"],
    faith: "HINDU_TEMPLE",
    emoji: "🏹",
    blurb: "Ravan dahan and Ramlila finales.",
    dates: ["2026-10-20", "2027-10-09", "2028-09-28"],
  },
  {
    name: "Diwali",
    shop: [
      { label: "Diyas & string lights", query: "diwali diya lights" },
      { label: "Rangoli & torans", query: "rangoli toran diwali" },
      { label: "Diwali gift boxes", query: "diwali gift box sweets" },
    ],
    genre: "diwali",
    keywords: ["diwali", "deepavali"],
    faith: "HINDU_TEMPLE",
    emoji: "🪔",
    blurb: "Festival of lights — Lakshmi puja, diyas and sweets.",
    dates: ["2026-11-08", "2027-10-29", "2028-10-17"],
  },
  {
    name: "Guru Nanak Jayanti (Gurpurab)",
    shop: [
      { label: "Sikh prayer books", query: "gutka sahib nitnem" },
      { label: "Rumala & chaur sahib", query: "rumala sahib" },
      { label: "Sikh gifts", query: "khanda kara sikh gift" },
    ],
    keywords: ["gurpurab", "guru nanak"],
    faith: "GURUDWARA",
    emoji: "🪯",
    blurb: "Birth of Guru Nanak Dev Ji — akhand path, nagar kirtan, langar.",
    dates: ["2026-11-24", "2027-11-14", "2028-11-02"],
  },
  {
    name: "Christmas",
    shop: [
      { label: "Christmas decor", query: "christmas decorations" },
      { label: "Christmas lights", query: "christmas lights outdoor" },
      { label: "Christmas gifts", query: "christmas gifts for family" },
    ],
    genre: "eid-christmas",
    keywords: ["christmas"],
    faith: "CHURCH",
    emoji: "🎄",
    blurb: "Midnight mass, carols and community feasts.",
    dates: ["2026-12-25", "2027-12-25", "2028-12-25"],
  },
];

export function festivalSlug(festival: Pick<Festival, "name">) {
  return festival.name
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function festivalBySlug(slug: string) {
  return FESTIVALS.find((festival) => festivalSlug(festival) === slug) ?? null;
}

export function festivalDates(festival: Festival) {
  return festival.dates.map((value) => new Date(`${value}T00:00:00Z`));
}

export type UpcomingFestival = Festival & { date: Date; daysAway: number };

/** Next occurrence of each festival, soonest first. */
export function upcomingFestivals(limit = 6, now = new Date()): UpcomingFestival[] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  return FESTIVALS.flatMap((festival) => {
    const next = festival.dates
      .map((value) => new Date(`${value}T00:00:00Z`))
      .find((date) => date.getTime() >= today);
    if (!next) return [];
    return [
      {
        ...festival,
        date: next,
        daysAway: Math.round((next.getTime() - today) / 86_400_000),
      },
    ];
  })
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, limit);
}

export function formatFestivalDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
