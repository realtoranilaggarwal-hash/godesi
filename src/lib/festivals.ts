import type { Faith } from "@prisma/client";

export type Festival = {
  name: string;
  faith: Faith;
  /** ISO dates, newest last. Lunar festivals move every year, so they are tabulated. */
  dates: string[];
  blurb: string;
  emoji: string;
};

/**
 * Lunar calendars (Hindu, Islamic, Sikh) cannot be derived from the Gregorian date,
 * so upcoming occurrences are tabulated and the next one is picked at render time.
 */
export const FESTIVALS: Festival[] = [
  {
    name: "Makar Sankranti",
    faith: "HINDU_TEMPLE",
    emoji: "🪁",
    blurb: "Harvest festival marked with kite flying, til-gud and holy dips.",
    dates: ["2026-01-14", "2027-01-14", "2028-01-14"],
  },
  {
    name: "Maha Shivaratri",
    faith: "HINDU_TEMPLE",
    emoji: "🔱",
    blurb: "Night-long vigil and abhishekam at Shiva temples.",
    dates: ["2026-02-15", "2027-03-06", "2028-02-23"],
  },
  {
    name: "Holi",
    faith: "HINDU_TEMPLE",
    emoji: "🎨",
    blurb: "Festival of colours; Holika Dahan the previous evening.",
    dates: ["2026-03-04", "2027-03-22", "2028-03-11"],
  },
  {
    name: "Ram Navami",
    faith: "HINDU_TEMPLE",
    emoji: "🏹",
    blurb: "Birth of Lord Rama — bhajans, processions and temple prasad.",
    dates: ["2026-03-27", "2027-04-15", "2028-04-03"],
  },
  {
    name: "Eid al-Fitr",
    faith: "MOSQUE",
    emoji: "🌙",
    blurb: "End of Ramadan — Eid namaz, sewaiyan and zakat al-fitr.",
    dates: ["2026-03-20", "2027-03-09", "2028-02-26"],
  },
  {
    name: "Baisakhi",
    faith: "GURUDWARA",
    emoji: "🌾",
    blurb: "Khalsa foundation day — nagar kirtan and langar at gurudwaras.",
    dates: ["2026-04-14", "2027-04-14", "2028-04-13"],
  },
  {
    name: "Good Friday",
    faith: "CHURCH",
    emoji: "✝️",
    blurb: "Passion services and the Way of the Cross.",
    dates: ["2026-04-03", "2027-03-26", "2028-04-14"],
  },
  {
    name: "Easter Sunday",
    faith: "CHURCH",
    emoji: "🕊️",
    blurb: "Resurrection Sunday — sunrise services and family lunches.",
    dates: ["2026-04-05", "2027-03-28", "2028-04-16"],
  },
  {
    name: "Mahavir Jayanti",
    faith: "JAIN_TEMPLE",
    emoji: "🪷",
    blurb: "Birth of Bhagwan Mahavir — rath yatra and temple abhishek.",
    dates: ["2026-03-31", "2027-04-18", "2028-04-07"],
  },
  {
    name: "Buddha Purnima",
    faith: "BUDDHIST_TEMPLE",
    emoji: "☸️",
    blurb: "Birth, enlightenment and nirvana of the Buddha.",
    dates: ["2026-05-01", "2027-05-20", "2028-05-09"],
  },
  {
    name: "Eid al-Adha",
    faith: "MOSQUE",
    emoji: "🕌",
    blurb: "Festival of sacrifice, marked with Eid namaz and qurbani.",
    dates: ["2026-05-27", "2027-05-17", "2028-05-05"],
  },
  {
    name: "Rath Yatra",
    faith: "HINDU_TEMPLE",
    emoji: "🛕",
    blurb: "Jagannath chariot procession, celebrated worldwide.",
    dates: ["2026-07-16", "2027-07-05", "2028-06-24"],
  },
  {
    name: "Raksha Bandhan",
    faith: "HINDU_TEMPLE",
    emoji: "🧵",
    blurb: "Sisters tie rakhi; temples hold community celebrations.",
    dates: ["2026-08-28", "2027-08-17", "2028-08-05"],
  },
  {
    name: "Janmashtami",
    faith: "HINDU_TEMPLE",
    emoji: "🪈",
    blurb: "Krishna's birth — midnight aarti, jhanki and dahi handi.",
    dates: ["2026-09-04", "2027-08-25", "2028-09-12"],
  },
  {
    name: "Ganesh Chaturthi",
    faith: "HINDU_TEMPLE",
    emoji: "🐘",
    blurb: "Ten days of Ganpati pandals, modaks and visarjan.",
    dates: ["2026-09-14", "2027-09-04", "2028-08-23"],
  },
  {
    name: "Navratri",
    faith: "HINDU_TEMPLE",
    emoji: "💃",
    blurb: "Nine nights of Durga puja, garba and dandiya.",
    dates: ["2026-10-11", "2027-09-30", "2028-09-19"],
  },
  {
    name: "Dussehra",
    faith: "HINDU_TEMPLE",
    emoji: "🏹",
    blurb: "Ravan dahan and Ramlila finales.",
    dates: ["2026-10-20", "2027-10-09", "2028-09-28"],
  },
  {
    name: "Diwali",
    faith: "HINDU_TEMPLE",
    emoji: "🪔",
    blurb: "Festival of lights — Lakshmi puja, diyas and sweets.",
    dates: ["2026-11-08", "2027-10-29", "2028-10-17"],
  },
  {
    name: "Guru Nanak Jayanti (Gurpurab)",
    faith: "GURUDWARA",
    emoji: "🪯",
    blurb: "Birth of Guru Nanak Dev Ji — akhand path, nagar kirtan, langar.",
    dates: ["2026-11-24", "2027-11-14", "2028-11-02"],
  },
  {
    name: "Christmas",
    faith: "CHURCH",
    emoji: "🎄",
    blurb: "Midnight mass, carols and community feasts.",
    dates: ["2026-12-25", "2027-12-25", "2028-12-25"],
  },
];

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
