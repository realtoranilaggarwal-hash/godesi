export const CHATTER_MAX = 500;
export const CHATTER_PAGE = 20;

/** Posts a member may make in the window before being asked to slow down. */
export const CHATTER_RATE = [
  { windowMs: 10 * 60 * 1000, max: 5, label: "10 minutes" },
  { windowMs: 24 * 60 * 60 * 1000, max: 40, label: "day" },
] as const;

/** Distinct reporters after which a post is hidden until staff review it. */
export const CHATTER_AUTO_HIDE_REPORTS = 3;

export const CHATTER_TOPICS = [
  { id: "general", label: "General chatter", emoji: "💬" },
  { id: "local", label: "Local community", emoji: "📍" },
  { id: "food", label: "Food", emoji: "🍛" },
  { id: "cricket", label: "Cricket & sports", emoji: "🏏" },
  { id: "bollywood", label: "Bollywood & entertainment", emoji: "🎬" },
  { id: "jobs", label: "Jobs & careers", emoji: "💼" },
  { id: "business", label: "Business", emoji: "🏪" },
  { id: "relationships", label: "Family & relationships", emoji: "❤️" },
  { id: "travel", label: "Travel & visa", emoji: "✈️" },
  { id: "culture", label: "Culture & festivals", emoji: "🪔" },
] as const;

export type ChatterTopicId = (typeof CHATTER_TOPICS)[number]["id"];

export const CHATTER_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी Hindi" },
  { code: "pa", label: "ਪੰਜਾਬੀ Punjabi" },
  { code: "gu", label: "ગુજરાતી Gujarati" },
  { code: "bn", label: "বাংলা Bengali" },
  { code: "ta", label: "தமிழ் Tamil" },
  { code: "te", label: "తెలుగు Telugu" },
  { code: "mr", label: "मराठी Marathi" },
  { code: "ur", label: "اردو Urdu" },
  { code: "ml", label: "മലയാളം Malayalam" },
  { code: "kn", label: "ಕನ್ನಡ Kannada" },
] as const;

export function isChatterTopic(value: string): value is ChatterTopicId {
  return CHATTER_TOPICS.some((topic) => topic.id === value);
}

export function topicOf(id: string) {
  return CHATTER_TOPICS.find((topic) => topic.id === id) ?? CHATTER_TOPICS[0];
}

export function isChatterLanguage(value: string) {
  return CHATTER_LANGUAGES.some((language) => language.code === value);
}
