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
