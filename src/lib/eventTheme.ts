import { CATEGORY_GRADIENTS, type CategoryColor } from "@/lib/categories";

/**
 * What an event is about, read from its title. Community calendars almost
 * never carry a photo, so the words are all we have to work with.
 */
const THEMES: { match: RegExp; icon: string; color: CategoryColor }[] = [
  { match: /garba|dandiya|navratri/, icon: "💃", color: "fuchsia" },
  { match: /diwali|deepavali|annakut|lamp/, icon: "🪔", color: "amber" },
  { match: /holi\b|rang/, icon: "🎨", color: "rose" },
  { match: /eid|ramadan|iftar/, icon: "🌙", color: "emerald" },
  { match: /christmas|carol/, icon: "🎄", color: "emerald" },
  { match: /gurpurab|gurdwara|kirtan|langar|nagar/, icon: "🧡", color: "orange" },
  { match: /eclipse|grahan/, icon: "🌘", color: "indigo" },
  { match: /abhishek|rudra|pooja|puja|homam|havan|archana|vratam|darshan/, icon: "🛕", color: "orange" },
  { match: /aarti|bhajan|sahasranama|parayanam|chalisa|satsang|katha/, icon: "🙏", color: "violet" },
  { match: /sadhya|prasad|bhandara|dinner|lunch|food|mela|feast/, icon: "🍛", color: "lime" },
  { match: /blood drive|health|camp|yoga|clinic/, icon: "❤️", color: "rose" },
  { match: /music|concert|sangeet|dance|nritya|natya/, icon: "🎶", color: "violet" },
  { match: /cricket|tournament|match|run\b|marathon/, icon: "🏏", color: "lime" },
  { match: /wedding|shaadi|matrimon/, icon: "💍", color: "rose" },
  { match: /class|workshop|seminar|training|webinar|talk/, icon: "🎓", color: "sky" },
  { match: /business|network|expo|fair|job/, icon: "🤝", color: "teal" },
  { match: /independence|republic|parade|flag/, icon: "🇮🇳", color: "orange" },
];

const PALETTE = Object.keys(CATEGORY_GRADIENTS) as CategoryColor[];

/** Same title always gets the same colour, so a page is varied but stable. */
function shade(title: string) {
  let total = 0;
  for (let index = 0; index < title.length; index += 1) {
    total = (total + title.charCodeAt(index) * (index + 1)) % 9973;
  }
  return PALETTE[total % PALETTE.length];
}

/** The icon and colour to show for an event that has no photo. */
export function eventTheme(
  title: string,
  icon?: string | null,
  color?: string | null,
) {
  const guess = themeFor(title);
  return { icon: icon ?? guess.icon, color: color ?? guess.color };
}

function themeFor(title: string) {
  const lower = title.toLowerCase();
  const theme = THEMES.find((option) => option.match.test(lower));
  return theme ?? { icon: "🎉", color: shade(title) };
}

/** Calendar venues often already carry the town: "SSVT, Lanham" in Lanham. */
export function placeLine(venue?: string | null, city?: string | null) {
  if (!venue) return city ?? "";
  if (!city || venue.toLowerCase().includes(city.toLowerCase())) return venue;
  return `${venue}, ${city}`;
}

