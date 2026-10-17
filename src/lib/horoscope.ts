import { localToUtc, siderealMoon } from "@/lib/kundli";
import { NAKSHATRAS, RASHIS } from "@/lib/kundliSigns";

export const HOROSCOPE_ZONE = "America/New_York";

export const SIGN_SLUGS = RASHIS.map((rashi) => rashi.english.toLowerCase());

export function signFromSlug(slug: string) {
  const index = SIGN_SLUGS.indexOf(slug);
  return index === -1 ? null : index;
}

export const SIGN_EMOJI = [
  "♈",
  "♉",
  "♊",
  "♋",
  "♌",
  "♍",
  "♎",
  "♏",
  "♐",
  "♑",
  "♒",
  "♓",
];

type Reading = {
  mood: "good" | "mixed" | "careful";
  headline: string;
  text: string;
  goodFor: string;
  goEasy: string;
};

/**
 * Chandra gochar: the day's reading depends on which house the transiting Moon
 * occupies counted from the reader's own Moon sign (index 0 = same sign).
 */
const TRANSIT_READINGS: Reading[] = [
  {
    mood: "mixed",
    headline: "The Moon is in your own sign",
    text: "Feelings run close to the surface today, and you notice your own needs more than usual. Eat well, dress in something you like and give yourself a little comfort before you look after everyone else.",
    goodFor: "self-care, a fresh start on a personal habit, family meals",
    goEasy: "taking every comment personally",
  },
  {
    mood: "mixed",
    headline: "Money and family talk",
    text: "The Moon moves through your house of wealth and speech. Conversations at home turn to money, food and plans. Kind words go a long way; so does a quick look at what you spent this week.",
    goodFor: "budgeting, cooking for family, calling relatives",
    goEasy: "impulse buys and sharp words",
  },
  {
    mood: "good",
    headline: "Courage and quick wins",
    text: "Energy and confidence lift. It's a good day to make the call you've been putting off, send the proposal, or take a short trip. Brothers, sisters and neighbours are helpful.",
    goodFor: "starting small tasks, short travel, writing and messaging",
    goEasy: "promising more than you can finish",
  },
  {
    mood: "careful",
    headline: "Home needs you",
    text: "The Moon passes your fourth house, of home and mother. You may feel restless or tired. Stay close to home if you can, sort the house, and check in on your mother or an elder.",
    goodFor: "home chores, quiet time, time with mother",
    goEasy: "long drives and big property decisions",
  },
  {
    mood: "mixed",
    headline: "Ideas, children and a busy mind",
    text: "Creativity and affection for children are strong, but the mind can race. Put the ideas on paper, play with the kids, and leave risky bets for another day.",
    goodFor: "study, hobbies, time with children",
    goEasy: "speculation, gambling and overthinking",
  },
  {
    mood: "good",
    headline: "Clear the to-do list",
    text: "A practical, winning day. Problems that looked big shrink once you tackle them. Good for health routines, paperwork, paying off small debts and settling disputes calmly.",
    goodFor: "exercise, a doctor's appointment, finishing pending work",
    goEasy: "skipping meals when busy",
  },
  {
    mood: "good",
    headline: "Partners and meetings",
    text: "The Moon sits opposite your sign, lighting up partnerships. Your spouse, business partner or clients are in focus, and meetings go smoothly. Say yes to a dinner invitation.",
    goodFor: "meetings, deals, date night, social events",
    goEasy: "letting others decide everything for you",
  },
  {
    mood: "careful",
    headline: "Chandrashtama: slow down",
    text: "This is the day many families call Chandrashtama, when the Moon is eighth from your sign. Keep the day simple. Avoid starting anything major, double-check documents and drive carefully. It passes in about two days.",
    goodFor: "rest, prayer, routine work",
    goEasy: "new ventures, arguments and big purchases",
  },
  {
    mood: "mixed",
    headline: "Blessings from elders",
    text: "Your ninth house of dharma and fortune is active. Visit a temple or gurdwara, call your father or a teacher, or read something that inspires you. Luck favours patience more than pushing.",
    goodFor: "puja, learning, planning a pilgrimage or long trip",
    goEasy: "rushing paperwork",
  },
  {
    mood: "good",
    headline: "Work and recognition",
    text: "The Moon crowns your tenth house of career. People notice your effort today. Present your work, ask for what you've earned, and take the lead on a team task.",
    goodFor: "interviews, presentations, important work",
    goEasy: "neglecting family time for work",
  },
  {
    mood: "good",
    headline: "Gains and good friends",
    text: "One of the best Moon days of the month. Friends and networks bring opportunities, payments arrive, and wishes move forward. Go to that community event.",
    goodFor: "networking, asking for favours, celebrations",
    goEasy: "overspending at the party",
  },
  {
    mood: "careful",
    headline: "Rest and let go",
    text: "The Moon is in your twelfth house, of rest and expenses. Energy may dip and money can slip away. Sleep early, meditate, give to charity, and leave big decisions for tomorrow.",
    goodFor: "meditation, charity, catching up on sleep",
    goEasy: "lending money and late nights",
  },
];

const WEEKDAYS = [
  { name: "Sunday", vaar: "Ravivar", lord: "Surya (Sun)", colour: "orange" },
  { name: "Monday", vaar: "Somvar", lord: "Chandra (Moon)", colour: "white" },
  { name: "Tuesday", vaar: "Mangalvar", lord: "Mangal (Mars)", colour: "red" },
  {
    name: "Wednesday",
    vaar: "Budhvar",
    lord: "Budh (Mercury)",
    colour: "green",
  },
  {
    name: "Thursday",
    vaar: "Guruvar",
    lord: "Guru (Jupiter)",
    colour: "yellow",
  },
  { name: "Friday", vaar: "Shukravar", lord: "Shukra (Venus)", colour: "pink" },
  {
    name: "Saturday",
    vaar: "Shanivar",
    lord: "Shani (Saturn)",
    colour: "blue",
  },
];

const signAt = (utc: Date) => Math.floor(siderealMoon(utc) / 30);

function zonedDate(now: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: HOROSCOPE_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export type DailySky = {
  date: string;
  dateLabel: string;
  weekday: (typeof WEEKDAYS)[number];
  moonSign: number;
  nakshatra: string;
  nextSign: { sign: number; at: string } | null;
};

/** Where the Moon is now, and when it changes sign later today (US Eastern). */
export function dailySky(now = new Date()): DailySky {
  const date = zonedDate(now);
  const start = localToUtc(date, "00:00", HOROSCOPE_ZONE);
  const end = localToUtc(date, "23:59", HOROSCOPE_ZONE);
  const noon = localToUtc(date, "12:00", HOROSCOPE_ZONE);
  const nowSign = signAt(now);
  const endSign = signAt(end);

  let nextSign: DailySky["nextSign"] = null;
  if (nowSign !== endSign && now < end) {
    let low = Math.max(start.getTime(), now.getTime());
    let high = end.getTime();
    while (high - low > 60 * 1000) {
      const mid = (low + high) / 2;
      if (signAt(new Date(mid)) === nowSign) low = mid;
      else high = mid;
    }
    nextSign = {
      sign: endSign,
      at: new Intl.DateTimeFormat("en-US", {
        timeZone: HOROSCOPE_ZONE,
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(high)),
    };
  }

  const moon = siderealMoon(now);
  return {
    date,
    dateLabel: new Intl.DateTimeFormat("en-US", {
      timeZone: HOROSCOPE_ZONE,
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(noon),
    weekday: WEEKDAYS[new Date(`${date}T12:00:00Z`).getUTCDay()],
    moonSign: nowSign,
    nakshatra: NAKSHATRAS[Math.floor(moon / (360 / 27))],
    nextSign,
  };
}

export function readingFor(sign: number, sky: DailySky) {
  const house = ((sky.moonSign - sign + 12) % 12) + 1;
  return { house, ...TRANSIT_READINGS[house - 1] };
}
