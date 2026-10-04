/**
 * Clubs: permanent groups (karaoke circles, cricket teams, book clubs) that put
 * on events. Shared between the forms, the pages and the server actions.
 */

export const CLUB_CATEGORIES = [
  { slug: "singing", label: "Singing & karaoke", emoji: "🎤" },
  { slug: "music", label: "Music & instruments", emoji: "🎵" },
  { slug: "dance", label: "Dance", emoji: "💃" },
  { slug: "food", label: "Food & cooking", emoji: "🍛" },
  { slug: "travel", label: "Travel & outdoors", emoji: "🧳" },
  { slug: "business", label: "Business & networking", emoji: "💼" },
  { slug: "professional", label: "Professional & careers", emoji: "🎓" },
  { slug: "sports", label: "Sports & fitness", emoji: "🏏" },
  { slug: "games", label: "Games & cards", emoji: "🎲" },
  { slug: "religious", label: "Religious & spiritual", emoji: "🪔" },
  { slug: "arts", label: "Arts, books & film", emoji: "🎨" },
  { slug: "family", label: "Families & kids", emoji: "👨‍👩‍👧" },
  { slug: "seniors", label: "Seniors", emoji: "🌿" },
  { slug: "volunteering", label: "Volunteering & seva", emoji: "🤝" },
  { slug: "other", label: "Something else", emoji: "✨" },
] as const;

export type ClubCategory = (typeof CLUB_CATEGORIES)[number]["slug"];

export function isClubCategory(slug: string): slug is ClubCategory {
  return CLUB_CATEGORIES.some((c) => c.slug === slug);
}

export function clubCategory(slug: string) {
  return (
    CLUB_CATEGORIES.find((c) => c.slug === slug) ??
    CLUB_CATEGORIES[CLUB_CATEGORIES.length - 1]
  );
}

/** What a member can offer to bring to an event. */
export const BRING_OPTIONS = [
  "Food",
  "Drinks",
  "Snacks",
  "Dessert",
  "Equipment",
  "Decorations",
  "Gifts",
  "Other",
] as const;

/** What a member can take part in at an event. */
export const PARTICIPATE_OPTIONS = [
  "Singing",
  "Dancing",
  "Music",
  "Speech",
  "Games",
  "Open mic",
  "Cooking",
  "Volunteering",
] as const;

export const CONTRIBUTION_MODES = [
  {
    value: "NONE",
    label: "No contribution",
    hint: "Free, or tickets only (set the price and ticket types above).",
  },
  {
    value: "SUGGESTED",
    label: "Suggested contribution",
    hint: "Pay-what-you-like with a suggested amount per person, collected by you at the door.",
  },
  {
    value: "CUSTOM",
    label: "Members choose",
    hint: "Each member says what they will chip in when they RSVP.",
  },
] as const;

export const RSVP_ANSWERS = [
  { value: "YES", label: "I'm coming" },
  { value: "MAYBE", label: "Maybe" },
  { value: "NO", label: "Can't make it" },
] as const;

/** House rules an organiser ticks instead of typing; stored as lines in `Club.rules`. */
export const CLUB_RULE_PRESETS = [
  "Respect everyone — no politics, religion debates or personal remarks.",
  "RSVP honestly and update it if your plans change; no-shows hurt the host.",
  "Bring what you signed up to bring; tell the organiser early if you can't.",
  "Arrive on time — we start at the posted hour.",
  "One song / one turn each until everyone has had a go.",
  "Cheer every performer; no heckling or filming without asking.",
  "Ask before posting photos or videos of members online.",
  "Share costs fairly — venue, food and equipment are split as the organiser posts.",
  "Guests are welcome only if the organiser agrees beforehand.",
  "No selling, promotions or recruiting at meets unless the organiser allows it.",
  "Drink responsibly; never drive after drinking.",
  "Help set up and clean up — leave the venue as we found it.",
  "Keep the WhatsApp group for club matters only.",
  "Members under 18 come with a parent or guardian.",
  "Organisers may remove anyone who breaks these rules.",
] as const;

const RULE_BULLET = "• ";

/** Ticked presets first, then the organiser's own lines. */
export function composeRules(presets: string[], extra: string) {
  const picked = CLUB_RULE_PRESETS.filter((r) => presets.includes(r)).map(
    (r) => RULE_BULLET + r,
  );
  const own = extra
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => (l.startsWith(RULE_BULLET) ? l : RULE_BULLET + l));
  return [...picked, ...own].join("\n") || null;
}

/** Splits stored rules back into ticked presets and the organiser's own lines. */
export function splitRules(rules: string | null | undefined) {
  const lines = (rules ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim().replace(/^•\s*/, ""))
    .filter(Boolean);
  const presets = lines.filter((l) =>
    (CLUB_RULE_PRESETS as readonly string[]).includes(l),
  );
  const extra = lines.filter((l) => !presets.includes(l));
  return { presets, extra: extra.join("\n"), lines };
}

/** Premium club: yearly price in USD; waives Godesi's ticket fee on club events. */
export const CLUB_PREMIUM_YEAR_USD = 49;

export function clubIsPremium(
  club: { premiumUntil: Date | null } | null | undefined,
  now: Date = new Date(),
) {
  return Boolean(
    club?.premiumUntil && club.premiumUntil.getTime() > now.getTime(),
  );
}
