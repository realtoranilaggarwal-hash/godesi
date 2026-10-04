/**
 * The "prepare for your interview" sheet a GoDesi Elite / Desi Who's Who
 * nominee fills in before recording. Answers are stored on
 * `EliteEntry.storySheet` keyed by question id and read back by the
 * interviewer's briefing page.
 */
export const STUDIO_ADDRESS =
  "GoDesi Media Studio, 1 Austin Ave, Suite C, Iselin, NJ 08830";

/** What one recorded conversation turns into; ticked off on the briefing. */
export const REPURPOSE_CHECKLIST = [
  "Full interview on the Desi Who's Who YouTube channel",
  "GoDesi Podcast episode (audio)",
  "5–10 YouTube Shorts",
  "Instagram Reels / Facebook clips / TikTok",
  "GoDesi News story",
  "Quote graphic (from the 'one line you live by')",
  "Video + recording link on the Elite profile",
  "Business card / personal profile updated and linked",
  "Guest sent the links to share with their customers",
];

export type StoryQuestion = {
  id: string;
  label: string;
  hint?: string;
  /** Single-line answer; everything else is a textarea. */
  short?: boolean;
};

export type StorySection = {
  title: string;
  intro?: string;
  questions: StoryQuestion[];
};

export const STORY_SECTIONS: StorySection[] = [
  {
    title: "Your journey",
    intro: "One person. One story. One lesson. Start at the beginning.",
    questions: [
      {
        id: "arrival",
        label: "How did you come to America (or Canada)?",
        hint: "Year, city you landed in, who you came with, what you had in your pocket.",
      },
      {
        id: "firstJob",
        label: "What was your first job here?",
        hint: "Even the gas-station shift counts — that is the story people remember.",
      },
      {
        id: "turningPoint",
        label: "What was the turning point that led to what you do today?",
      },
    ],
  },
  {
    title: "Building it",
    questions: [
      {
        id: "biggestChallenge",
        label: "What was your biggest challenge?",
      },
      {
        id: "biggestOpportunity",
        label: "What was your biggest opportunity, and how did you get it?",
      },
      {
        id: "mistake",
        label: "Which mistake taught you the most?",
      },
      {
        id: "howBuilt",
        label: "How did you build your business or career, step by step?",
        hint: "Numbers help: first customer, first hire, first $1M, first branch.",
      },
    ],
  },
  {
    title: "Looking back, looking ahead",
    questions: [
      {
        id: "advice",
        label: "What advice would you give a young desi starting out?",
      },
      {
        id: "differently",
        label: "What would you do differently?",
      },
      {
        id: "success",
        label: "What does success mean to you today?",
      },
      {
        id: "proud",
        label: "Three things you are most proud of",
        hint: "Awards, people you trained, a family milestone, a community effort.",
      },
      {
        id: "quote",
        label: "One line you live by",
        hint: "Becomes the quote graphic we share with your clip.",
        short: true,
      },
    ],
  },
  {
    title: "For the interviewer only",
    intro:
      "This part is never published — it just helps us do the interview well.",
    questions: [
      {
        id: "pronounce",
        label: "How do we pronounce your name? Any title you prefer?",
        short: true,
      },
      {
        id: "avoid",
        label: "Anything you would rather we did not ask about?",
      },
      {
        id: "language",
        label: "Language you are most comfortable in",
        hint: "English, Hindi, Punjabi, Gujarati, Telugu, Tamil, Bengali, Urdu… we can mix.",
        short: true,
      },
      {
        id: "availability",
        label: "Best days and times for a 45-minute recording",
        hint: "Weekday evenings? Saturday mornings? Studio in Iselin NJ or Zoom?",
        short: true,
      },
      {
        id: "guests",
        label:
          "Anyone you would like beside you (spouse, partner, co-founder)?",
        short: true,
      },
    ],
  },
];

export const STORY_QUESTIONS: StoryQuestion[] = STORY_SECTIONS.flatMap(
  (section) => section.questions,
);

/** Section titles whose answers stay off the public profile. */
export const PRIVATE_SECTION = "For the interviewer only";

export type StoryAnswers = Record<string, string>;

/** Narrows the loose Json column to the answers we wrote. */
export function readStoryAnswers(value: unknown): StoryAnswers {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const answers: StoryAnswers = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (typeof raw === "string" && raw.trim()) answers[key] = raw;
  }
  return answers;
}

export function storyProgress(answers: StoryAnswers) {
  const total = STORY_QUESTIONS.length;
  const done = STORY_QUESTIONS.filter((q) => answers[q.id]).length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}
