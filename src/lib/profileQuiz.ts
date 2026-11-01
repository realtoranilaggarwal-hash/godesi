/**
 * The get-to-know-me quiz: a handful of friendly questions new members answer
 * so their public profile isn't empty. Stored as {key → answer} on
 * User.profileFacts; answers are shown under the profile as a Q&A card.
 */

export type ProfileQuestion = {
  key: string;
  emoji: string;
  question: string;
  placeholder: string;
};

export const PROFILE_QUESTIONS: ProfileQuestion[] = [
  {
    key: "roots",
    emoji: "🏡",
    question: "Which desi hometown are you from (or love)?",
    placeholder: "e.g. Ahmedabad · Chandigarh · Lahore",
  },
  {
    key: "chai",
    emoji: "☕",
    question: "Chai, coffee, or thanda? Pick your drink.",
    placeholder: "e.g. Adrak chai, always",
  },
  {
    key: "food",
    emoji: "🍛",
    question: "One dish you could eat every day?",
    placeholder: "e.g. Mom's rajma chawal",
  },
  {
    key: "work",
    emoji: "💼",
    question: "What do you do, in one line?",
    placeholder: "e.g. Realtor helping families find homes",
  },
  {
    key: "hiddenTalent",
    emoji: "🎤",
    question: "A talent or hobby most people don't know about?",
    placeholder: "e.g. I can mimic 5 film stars",
  },
  {
    key: "dreamTrip",
    emoji: "✈️",
    question: "Dream trip — one place on your bucket list?",
    placeholder: "e.g. Kedarnath, then Switzerland",
  },
  {
    key: "askMe",
    emoji: "🙌",
    question: "What can people ask you for help with?",
    placeholder: "e.g. First-time home loans, taxes, IIT prep",
  },
  {
    key: "superpower",
    emoji: "🦸",
    question: "If you could have any superpower?",
    placeholder: "e.g. Pause time during festivals",
  },
];

export type ProfileFact = { emoji: string; question: string; answer: string };

/** Ordered answered facts for rendering — unknown keys and blanks dropped. */
export function profileFactsList(facts: unknown): ProfileFact[] {
  if (!facts || typeof facts !== "object") return [];
  const map = facts as Record<string, unknown>;
  return PROFILE_QUESTIONS.filter((q) => {
    const value = map[q.key];
    return typeof value === "string" && value.trim().length > 0;
  }).map((q) => ({
    emoji: q.emoji,
    question: q.question,
    answer: (map[q.key] as string).trim(),
  }));
}
