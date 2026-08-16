import { CATEGORY_GRADIENTS, gradientFor, type CategoryColor } from "@/lib/categories";
import { formatEventDate } from "@/lib/events";

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

/**
 * Stands in for a missing photo. A bare coloured band reads as a broken image,
 * so the fallback carries the event's own details instead.
 */
export function EventPoster({
  title,
  startsAt,
  venue,
  city,
  icon,
  color,
  className = "h-40",
  large = false,
}: {
  title: string;
  startsAt: Date;
  venue?: string | null;
  city?: string | null;
  /** The category's icon and colour win when the event has a category. */
  icon?: string | null;
  color?: string | null;
  className?: string;
  large?: boolean;
}) {
  const theme = themeFor(title);
  const place = placeLine(venue, city);

  return (
    <div
      className={`flex ${className} w-full flex-col items-center justify-center gap-1 bg-gradient-to-br ${gradientFor(
        color ?? theme.color,
      )} px-3 text-center text-white`}
    >
      <span aria-hidden className={large ? "text-5xl" : "text-3xl"}>
        {icon ?? theme.icon}
      </span>
      <span
        className={`font-black uppercase tracking-wide opacity-95 ${
          large ? "text-sm" : "text-[11px]"
        }`}
      >
        {formatEventDate(startsAt)}
      </span>
      {place ? (
        <span
          className={`line-clamp-1 opacity-90 ${large ? "text-sm" : "text-[11px]"}`}
        >
          📍 {place}
        </span>
      ) : null}
    </div>
  );
}
