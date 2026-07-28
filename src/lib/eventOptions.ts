/** Shared event vocabulary — drives the posting form, the badges and the filters. */
export const EVENT_TYPES = [
  "Conference",
  "Workshop",
  "Seminar / Webinar",
  "Meetup / Networking",
  "Concert / Live show",
  "Festival / Mela",
  "Puja / Satsang",
  "Exhibition / Expo",
  "Class / Course",
  "Sports / Tournament",
  "Fundraiser",
  "Party / Social",
  "Kids & family",
  "Other",
] as const;

export const EVENT_MODES = [
  { value: "OFFLINE", label: "Offline — in person", icon: "📍" },
  { value: "ONLINE", label: "Online — join from anywhere", icon: "💻" },
  { value: "HYBRID", label: "Hybrid — in person and online", icon: "🔀" },
] as const;

export const EVENT_FREQUENCIES = [
  { value: "ONE_TIME", label: "One-time" },
  { value: "RECURRING", label: "Recurring" },
] as const;

export type EventModeValue = (typeof EVENT_MODES)[number]["value"];
export type EventFrequencyValue = (typeof EVENT_FREQUENCIES)[number]["value"];

export function eventModeLabel(mode: string) {
  return EVENT_MODES.find((item) => item.value === mode)?.label ?? mode;
}

export function eventModeIcon(mode: string) {
  return EVENT_MODES.find((item) => item.value === mode)?.icon ?? "📍";
}
