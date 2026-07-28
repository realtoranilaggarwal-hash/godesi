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

/**
 * What the event offers, ticked by the organiser and filtered on by attendees —
 * the car-portal style facets of /events. Values are stored verbatim on the
 * event, so never rename one without a data migration.
 */
export const EVENT_FEATURE_GROUPS = [
  {
    key: "facilities",
    label: "Facilities",
    options: [
      { value: "Valet parking", icon: "🅿️" },
      { value: "Free parking", icon: "🚗" },
      { value: "Wheelchair accessible", icon: "♿" },
      { value: "Indoor event", icon: "🏛️" },
      { value: "Outdoor event", icon: "🌤️" },
    ],
  },
  {
    key: "food",
    label: "Food & drinks",
    options: [
      { value: "Free food", icon: "🍽️" },
      { value: "Paid food", icon: "🧾" },
      { value: "Alcohol available", icon: "🍷" },
      { value: "Vegetarian options", icon: "🥗" },
    ],
  },
  {
    key: "crowd",
    label: "Security & crowd",
    options: [
      { value: "Security / bouncers", icon: "🛡️" },
      { value: "Family friendly", icon: "👨‍👩‍👧" },
      { value: "18+ only", icon: "🔞" },
    ],
  },
  {
    key: "commerce",
    label: "Vendors & sponsors",
    options: [
      { value: "Vendor booths available", icon: "🏬" },
      { value: "Sponsorship slots available", icon: "🤝" },
      { value: "Stall booking open", icon: "🛒" },
    ],
  },
  {
    key: "ticketing",
    label: "Ticketing",
    options: [
      { value: "Online ticket sales", icon: "💳" },
      { value: "On-spot tickets", icon: "🎫" },
      { value: "VIP passes", icon: "⭐" },
    ],
  },
] as const;

export const EVENT_FEATURES: string[] = EVENT_FEATURE_GROUPS.flatMap((group) =>
  group.options.map((option) => option.value),
);

export function eventFeatureIcon(value: string) {
  for (const group of EVENT_FEATURE_GROUPS) {
    const match = group.options.find((option) => option.value === value);
    if (match) return match.icon;
  }
  return "✅";
}

/** Only the ticks worth showing as a quick filter chip on /events. */
export const EVENT_FEATURE_FILTERS = [
  "Free parking",
  "Valet parking",
  "Wheelchair accessible",
  "Indoor event",
  "Outdoor event",
  "Free food",
  "Family friendly",
  "18+ only",
  "Vendor booths available",
  "Sponsorship slots available",
] as const;

/** What the organiser commits to in return for free Godesi promotion. */
export const PARTNER_COMMITMENTS = [
  { name: "partnerBanner", label: "Place 1 Godesi banner at the venue" },
  { name: "partnerStandee", label: "Place 1 Godesi standee at the entrance" },
  { name: "partnerProof", label: "Upload proof photos before the event" },
  { name: "partnerBranding", label: "Keep the branding visible during the event" },
] as const;

export type EventModeValue = (typeof EVENT_MODES)[number]["value"];
export type EventFrequencyValue = (typeof EVENT_FREQUENCIES)[number]["value"];

export function eventModeLabel(mode: string) {
  return EVENT_MODES.find((item) => item.value === mode)?.label ?? mode;
}

export function eventModeIcon(mode: string) {
  return EVENT_MODES.find((item) => item.value === mode)?.icon ?? "📍";
}
