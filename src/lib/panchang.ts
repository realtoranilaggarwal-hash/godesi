import { Body, Observer, SearchRiseSet } from "astronomy-engine";
import { FESTIVALS } from "@/lib/festivals";
import { localToUtc, siderealMoon, siderealSun } from "@/lib/kundli";
import { NAKSHATRAS } from "@/lib/kundliSigns";

export type PanchangCity = {
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
  timeZone: string;
};

/** Cities with their own panchang page; the visitor's own location is used when Vercel reports it. */
export const PANCHANG_CITIES: PanchangCity[] = [
  {
    slug: "new-york",
    name: "New York",
    latitude: 40.7128,
    longitude: -74.006,
    timeZone: "America/New_York",
  },
  {
    slug: "edison-nj",
    name: "Edison, NJ",
    latitude: 40.5187,
    longitude: -74.4121,
    timeZone: "America/New_York",
  },
  {
    slug: "chicago",
    name: "Chicago",
    latitude: 41.8781,
    longitude: -87.6298,
    timeZone: "America/Chicago",
  },
  {
    slug: "houston",
    name: "Houston",
    latitude: 29.7604,
    longitude: -95.3698,
    timeZone: "America/Chicago",
  },
  {
    slug: "dallas",
    name: "Dallas",
    latitude: 32.7767,
    longitude: -96.797,
    timeZone: "America/Chicago",
  },
  {
    slug: "atlanta",
    name: "Atlanta",
    latitude: 33.749,
    longitude: -84.388,
    timeZone: "America/New_York",
  },
  {
    slug: "washington-dc",
    name: "Washington, DC",
    latitude: 38.9072,
    longitude: -77.0369,
    timeZone: "America/New_York",
  },
  {
    slug: "san-francisco-bay-area",
    name: "San Francisco Bay Area",
    latitude: 37.3382,
    longitude: -121.8863,
    timeZone: "America/Los_Angeles",
  },
  {
    slug: "los-angeles",
    name: "Los Angeles",
    latitude: 34.0522,
    longitude: -118.2437,
    timeZone: "America/Los_Angeles",
  },
  {
    slug: "seattle",
    name: "Seattle",
    latitude: 47.6062,
    longitude: -122.3321,
    timeZone: "America/Los_Angeles",
  },
  {
    slug: "toronto",
    name: "Toronto",
    latitude: 43.6532,
    longitude: -79.3832,
    timeZone: "America/Toronto",
  },
  {
    slug: "vancouver",
    name: "Vancouver",
    latitude: 49.2827,
    longitude: -123.1207,
    timeZone: "America/Vancouver",
  },
  {
    slug: "london",
    name: "London",
    latitude: 51.5072,
    longitude: -0.1276,
    timeZone: "Europe/London",
  },
  {
    slug: "dubai",
    name: "Dubai",
    latitude: 25.2048,
    longitude: 55.2708,
    timeZone: "Asia/Dubai",
  },
  {
    slug: "sydney",
    name: "Sydney",
    latitude: -33.8688,
    longitude: 151.2093,
    timeZone: "Australia/Sydney",
  },
  {
    slug: "delhi",
    name: "Delhi",
    latitude: 28.6139,
    longitude: 77.209,
    timeZone: "Asia/Kolkata",
  },
  {
    slug: "mumbai",
    name: "Mumbai",
    latitude: 19.076,
    longitude: 72.8777,
    timeZone: "Asia/Kolkata",
  },
];

export const DEFAULT_PANCHANG_CITY = PANCHANG_CITIES[0];

export function panchangCity(slug: string) {
  return PANCHANG_CITIES.find((city) => city.slug === slug) ?? null;
}

const TITHIS = [
  "Pratipada",
  "Dwitiya",
  "Tritiya",
  "Chaturthi",
  "Panchami",
  "Shashthi",
  "Saptami",
  "Ashtami",
  "Navami",
  "Dashami",
  "Ekadashi",
  "Dwadashi",
  "Trayodashi",
  "Chaturdashi",
];

const YOGAS = [
  "Vishkambha",
  "Priti",
  "Ayushman",
  "Saubhagya",
  "Shobhana",
  "Atiganda",
  "Sukarma",
  "Dhriti",
  "Shula",
  "Ganda",
  "Vriddhi",
  "Dhruva",
  "Vyaghata",
  "Harshana",
  "Vajra",
  "Siddhi",
  "Vyatipata",
  "Variyan",
  "Parigha",
  "Shiva",
  "Siddha",
  "Sadhya",
  "Shubha",
  "Shukla",
  "Brahma",
  "Indra",
  "Vaidhriti",
];

const VAARS = [
  "Ravivar",
  "Somvar",
  "Mangalvar",
  "Budhvar",
  "Guruvar",
  "Shukravar",
  "Shanivar",
];

/** Which eighth of the daylight (1–8) each period falls in, Sunday first. */
const RAHU_KAAL = [8, 2, 7, 5, 6, 4, 3];
const YAMAGANDA = [5, 4, 3, 2, 1, 7, 6];
const GULIKA = [7, 6, 5, 4, 3, 2, 1];

/** Monthly observances keyed by tithi index (0–29) at sunrise. */
const OBSERVANCES: Record<number, string> = {
  3: "Vinayaka Chaturthi",
  7: "Durga Ashtami",
  10: "Ekadashi fast",
  12: "Pradosh vrat",
  14: "Purnima",
  18: "Sankashti Chaturthi",
  22: "Kalashtami",
  25: "Ekadashi fast",
  27: "Pradosh vrat",
  28: "Masik Shivaratri",
  29: "Amavasya",
};

const norm = (deg: number) => ((deg % 360) + 360) % 360;
const HOUR = 3600 * 1000;

const tithiAt = (utc: Date) =>
  Math.floor(norm(siderealMoon(utc) - siderealSun(utc)) / 12);
const nakshatraAt = (utc: Date) => Math.floor(siderealMoon(utc) / (360 / 27));
const yogaAt = (utc: Date) =>
  Math.floor(norm(siderealSun(utc) + siderealMoon(utc)) / (360 / 27));

/** When `value` next changes after `from`, to the minute; tithis and nakshatras last under 27 hours. */
function nextChange(value: (utc: Date) => number, from: Date) {
  const start = value(from);
  let low = from.getTime();
  let high = low;
  while (value(new Date(high)) === start) {
    if (high - low > 30 * HOUR) return null;
    high += 2 * HOUR;
  }
  while (high - low > 60 * 1000) {
    const mid = (low + high) / 2;
    if (value(new Date(mid)) === start) low = mid;
    else high = mid;
  }
  return new Date(high);
}

export function tithiName(index: number) {
  if (index === 14) return "Purnima";
  if (index === 29) return "Amavasya";
  return TITHIS[index % 15];
}

export type Period = { start: Date; end: Date };

export type Panchang = {
  date: string;
  timeZone: string;
  vaar: string;
  sunrise: Date;
  sunset: Date;
  tithi: { name: string; paksha: "Shukla" | "Krishna"; endsAt: Date | null };
  nakshatra: { name: string; endsAt: Date | null };
  yoga: string;
  rahuKaal: Period;
  yamaganda: Period;
  gulika: Period;
  abhijit: Period | null;
  observances: string[];
};

/** Today's date (YYYY-MM-DD) in a time zone. */
export function todayIn(timeZone: string, now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(now);
}

/**
 * Sunrise panchang for one place and local date, the way most printed
 * panchangs reckon the day. Null where the sun doesn't rise (polar days).
 */
export function computePanchang(
  place: { latitude: number; longitude: number; timeZone: string },
  date: string,
): Panchang | null {
  const observer = new Observer(place.latitude, place.longitude, 0);
  const midnight = localToUtc(date, "00:00", place.timeZone);
  const rise = SearchRiseSet(Body.Sun, observer, +1, midnight, 1);
  if (!rise) return null;
  const set = SearchRiseSet(Body.Sun, observer, -1, rise.date, 1);
  if (!set) return null;
  const sunrise = rise.date;
  const sunset = set.date;

  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  const part = (sunset.getTime() - sunrise.getTime()) / 8;
  const eighth = (n: number): Period => ({
    start: new Date(sunrise.getTime() + (n - 1) * part),
    end: new Date(sunrise.getTime() + n * part),
  });
  const midday = (sunrise.getTime() + sunset.getTime()) / 2;
  const muhurta = (sunset.getTime() - sunrise.getTime()) / 15;

  const tithi = tithiAt(sunrise);
  const festivals = FESTIVALS.filter((festival) =>
    festival.dates.includes(date),
  ).map((festival) => `${festival.emoji} ${festival.name}`);

  return {
    date,
    timeZone: place.timeZone,
    vaar: VAARS[weekday],
    sunrise,
    sunset,
    tithi: {
      name: tithiName(tithi),
      paksha: tithi < 15 ? "Shukla" : "Krishna",
      endsAt: nextChange(tithiAt, sunrise),
    },
    nakshatra: {
      name: NAKSHATRAS[nakshatraAt(sunrise)],
      endsAt: nextChange(nakshatraAt, sunrise),
    },
    yoga: YOGAS[yogaAt(sunrise)],
    rahuKaal: eighth(RAHU_KAAL[weekday]),
    yamaganda: eighth(YAMAGANDA[weekday]),
    gulika: eighth(GULIKA[weekday]),
    abhijit:
      weekday === 3
        ? null
        : {
            start: new Date(midday - muhurta / 2),
            end: new Date(midday + muhurta / 2),
          },
    observances: [
      ...festivals,
      ...(OBSERVANCES[tithi] ? [OBSERVANCES[tithi]] : []),
    ],
  };
}

export function panchangTime(value: Date, timeZone: string, withDay = false) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    ...(withDay ? { weekday: "short" } : {}),
  }).format(value);
}
