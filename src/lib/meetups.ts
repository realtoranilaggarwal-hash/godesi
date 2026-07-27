import type { MeetupGender, MeetupMarital } from "@prisma/client";

/** What members are open to; deliberately platonic, no dating option. */
export const MEETUP_INTENTS = [
  { id: "business", label: "Business & networking" },
  { id: "coffee", label: "Coffee catch-up" },
  { id: "chit-chat", label: "Friendly chit-chat" },
  { id: "community", label: "Community & volunteering" },
  { id: "activity", label: "Sports & activities" },
] as const;

export type MeetupIntent = (typeof MEETUP_INTENTS)[number]["id"];

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
