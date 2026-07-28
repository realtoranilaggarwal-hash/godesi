import type { MeetupGender, MeetupMarital } from "@prisma/client";

/**
 * What members are open to, grouped for the form. Deliberately professional and
 * community focused — Connect is for networking and activities, not dating.
 */
type MeetupIntent = { id: string; label: string };
type MeetupIntentGroup = { id: string; label: string; intents: MeetupIntent[] };

export const MEETUP_INTENT_GROUPS: MeetupIntentGroup[] = [
  {
    id: "professional",
    label: "Professional",
    intents: [
      { id: "business", label: "Business & networking" },
      { id: "industry", label: "Industry discussions" },
      { id: "mentorship", label: "Mentorship & guidance" },
    ],
  },
  {
    id: "community",
    label: "Community",
    intents: [
      { id: "cultural", label: "Cultural meetups" },
      { id: "community", label: "Local community groups" },
      { id: "volunteering", label: "Community & volunteering" },
      { id: "family", label: "Family-friendly activities" },
    ],
  },
  {
    id: "activities",
    label: "Activities",
    intents: [
      { id: "coffee", label: "Coffee catch-up" },
      { id: "workshops", label: "Workshops & learning" },
      { id: "fitness", label: "Fitness & wellness" },
      { id: "hobby", label: "Hobby groups" },
      { id: "activity", label: "Sports & activities" },
      { id: "chit-chat", label: "Friendly conversation" },
    ],
  },
];

export const MEETUP_INTENTS: MeetupIntent[] = MEETUP_INTENT_GROUPS.flatMap(
  (group) => group.intents,
);

export const MEETUP_INTENT_NOTE =
  "This section is for networking, community, and activities — not dating.";

export const INTENT_LABELS: Record<string, string> = Object.fromEntries(
  MEETUP_INTENTS.map((intent) => [intent.id, intent.label]),
);

export const GENDER_LABELS: Record<MeetupGender, string> = {
  WOMAN: "Woman",
  MAN: "Man",
  OTHER: "Other",
};

export const MARITAL_LABELS: Record<MeetupMarital, string> = {
  SINGLE: "Single",
  MARRIED: "Married",
  PREFER_NOT_SAY: "Prefer not to say",
};

export const MEETUP_MIN_AGE = 18;
export const MEETUP_MAX_AGE = 90;

export function parseIntents(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item in INTENT_LABELS);
}

export function intentLabels(value: string) {
  return parseIntents(value).map((id) => INTENT_LABELS[id]);
}

/** Coordinates are stored rounded to ~1km so a card never pinpoints a home. */
export function roundCoord(value: number) {
  return Math.round(value * 100) / 100;
}

/** Great-circle distance in km between two rounded coordinates. */
export function distanceKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * 6371 * Math.asin(Math.sqrt(h)));
}

export function nearbyLabel(km: number) {
  return km <= 1 ? "Less than 1 km away" : `${km} km away`;
}
