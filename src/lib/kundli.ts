import {
  Body,
  GeoVector,
  MakeTime,
  RotateVector,
  Rotation_EQJ_ECT,
  SiderealTime,
  SphereFromVector,
  e_tilt,
  type AstroTime,
} from "astronomy-engine";
import { NAKSHATRAS } from "@/lib/kundliSigns";

const GRAHAS = [
  { key: "Sun", name: "Surya (Sun)", short: "Su", body: Body.Sun },
  { key: "Moon", name: "Chandra (Moon)", short: "Mo", body: Body.Moon },
  { key: "Mars", name: "Mangal (Mars)", short: "Ma", body: Body.Mars },
  { key: "Mercury", name: "Budh (Mercury)", short: "Me", body: Body.Mercury },
  { key: "Jupiter", name: "Guru (Jupiter)", short: "Ju", body: Body.Jupiter },
  { key: "Venus", name: "Shukra (Venus)", short: "Ve", body: Body.Venus },
  { key: "Saturn", name: "Shani (Saturn)", short: "Sa", body: Body.Saturn },
] as const;

export type Placement = {
  key: string;
  name: string;
  short: string;
  longitude: number;
  sign: number;
  degree: number;
  house: number | null;
  retrograde: boolean;
};

export type Kundli = {
  lagna: { sign: number; degree: number } | null;
  moonSign: number;
  sunSign: number;
  nakshatra: { index: number; name: string; pada: number };
  ayanamsa: number;
  planets: Placement[];
};

const norm = (deg: number) => ((deg % 360) + 360) % 360;
const rad = (deg: number) => (deg * Math.PI) / 180;

function centuries(time: AstroTime) {
  return time.tt / 36525;
}

/** Lahiri (Chitrapaksha) ayanamsa, accurate to about an arc-minute for 1800–2100. */
export function lahiriAyanamsa(time: AstroTime) {
  const t = centuries(time);
  return 23.85306 + 1.39688 * t + 0.000307 * t * t;
}

function tropicalLongitude(body: Body, time: AstroTime) {
  const vector = RotateVector(
    Rotation_EQJ_ECT(time),
    GeoVector(body, time, true),
  );
  return SphereFromVector(vector).lon;
}

/** Sidereal (Lahiri) longitude of the Sun at a moment, in degrees. */
export function siderealSun(utc: Date) {
  const time = MakeTime(utc);
  return norm(tropicalLongitude(Body.Sun, time) - lahiriAyanamsa(time));
}

/** Sidereal (Lahiri) longitude of the Moon at a moment, in degrees. */
export function siderealMoon(utc: Date) {
  const time = MakeTime(utc);
  return norm(tropicalLongitude(Body.Moon, time) - lahiriAyanamsa(time));
}

/** Mean lunar node (Rahu), Meeus ch. 47. */
function meanRahu(time: AstroTime) {
  const t = centuries(time);
  return norm(
    125.0445479 - 1934.1362891 * t + 0.0020754 * t * t + (t * t * t) / 467441,
  );
}

function tropicalAscendant(
  time: AstroTime,
  latitude: number,
  longitude: number,
) {
  const ramc = rad(norm(SiderealTime(time) * 15 + longitude));
  const obliquity = rad(e_tilt(time).tobl);
  const asc = Math.atan2(
    Math.cos(ramc),
    -(
      Math.sin(ramc) * Math.cos(obliquity) +
      Math.tan(rad(latitude)) * Math.sin(obliquity)
    ),
  );
  return norm((asc * 180) / Math.PI);
}

const signOf = (siderealLongitude: number) =>
  Math.floor(siderealLongitude / 30);

/**
 * Sidereal (Lahiri) Vedic chart with whole-sign houses. Pass `latitude` and
 * `longitude` with `withLagna` false when the birth time is unknown.
 */
export function computeKundli(
  utc: Date,
  latitude: number,
  longitude: number,
  withLagna: boolean,
): Kundli {
  const time = MakeTime(utc);
  const later = MakeTime(new Date(utc.getTime() + 6 * 3600 * 1000));
  const ayanamsa = lahiriAyanamsa(time);
  const sidereal = (tropical: number) => norm(tropical - ayanamsa);

  const lagnaLongitude = withLagna
    ? sidereal(tropicalAscendant(time, latitude, longitude))
    : null;
  const lagnaSign = lagnaLongitude === null ? null : signOf(lagnaLongitude);
  const houseOf = (sign: number) =>
    lagnaSign === null ? null : ((sign - lagnaSign + 12) % 12) + 1;

  const place = (
    key: string,
    name: string,
    short: string,
    lon: number,
    retrograde: boolean,
  ): Placement => {
    const sign = signOf(lon);
    return {
      key,
      name,
      short,
      longitude: lon,
      sign,
      degree: lon - sign * 30,
      house: houseOf(sign),
      retrograde,
    };
  };

  const planets = GRAHAS.map((graha) => {
    const now = tropicalLongitude(graha.body, time);
    const next = tropicalLongitude(graha.body, later);
    const motion = ((next - now + 540) % 360) - 180;
    return place(
      graha.key,
      graha.name,
      graha.short,
      sidereal(now),
      graha.body !== Body.Sun && graha.body !== Body.Moon && motion < 0,
    );
  });
  const rahu = sidereal(meanRahu(time));
  planets.push(place("Rahu", "Rahu", "Ra", rahu, true));
  planets.push(place("Ketu", "Ketu", "Ke", norm(rahu + 180), true));

  const moon = planets[1].longitude;
  const span = 360 / 27;
  const nakshatraIndex = Math.floor(moon / span);

  return {
    lagna:
      lagnaLongitude === null || lagnaSign === null
        ? null
        : { sign: lagnaSign, degree: lagnaLongitude - lagnaSign * 30 },
    moonSign: planets[1].sign,
    sunSign: planets[0].sign,
    nakshatra: {
      index: nakshatraIndex,
      name: NAKSHATRAS[nakshatraIndex],
      pada: Math.floor((moon - nakshatraIndex * span) / (span / 4)) + 1,
    },
    ayanamsa,
    planets,
  };
}

function zoneOffsetMs(at: number, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(at));
  const get = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );
  return asUtc - Math.floor(at / 1000) * 1000;
}

/** Converts a wall-clock birth time in an IANA zone (DST and history aware) to UTC. */
export function localToUtc(date: string, time: string, timeZone: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const wall = Date.UTC(year, month - 1, day, hour, minute);
  let utc = wall - zoneOffsetMs(wall, timeZone);
  utc = wall - zoneOffsetMs(utc, timeZone);
  return new Date(utc);
}

/** The wall-clock date and time ("YYYY-MM-DD HH:mm") an instant shows in a zone. */
export function wallClock(utc: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(utc);
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}`;
}
