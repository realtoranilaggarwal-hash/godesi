/**
 * One topic list for both member reports and wire stories, so readers can
 * filter /news by what they care about. Older rows were saved with the small
 * "Local / Business / Event / Alert" list and the feed topics, so `topicSlug`
 * maps those onto the same buckets instead of leaving them unfiltered.
 */
export type NewsTopic = { slug: string; label: string; emoji: string };

export const NEWS_TOPICS: NewsTopic[] = [
  { slug: "community", label: "Community", emoji: "🏘️" },
  { slug: "politics", label: "Politics & civic", emoji: "🏛️" },
  { slug: "business", label: "Business & money", emoji: "💼" },
  { slug: "immigration", label: "Immigration & visas", emoji: "🛂" },
  { slug: "crime", label: "Crime & safety", emoji: "🚨" },
  { slug: "events", label: "Events & festivals", emoji: "🎉" },
  { slug: "faith", label: "Religion & faith", emoji: "🕉️" },
  { slug: "jobs", label: "Jobs & careers", emoji: "🧑‍💻" },
  { slug: "education", label: "Education & students", emoji: "🎓" },
  { slug: "health", label: "Health", emoji: "🩺" },
  { slug: "housing", label: "Housing & real estate", emoji: "🏠" },
  { slug: "sports", label: "Sports", emoji: "🏏" },
  { slug: "entertainment", label: "Films & entertainment", emoji: "🎬" },
  { slug: "weather", label: "Weather & traffic", emoji: "🌧️" },
  { slug: "india", label: "India & back home", emoji: "🇮🇳" },
  { slug: "general", label: "General", emoji: "📰" },
];

const BY_SLUG = new Map(NEWS_TOPICS.map((topic) => [topic.slug, topic]));

/** Labels the reporter picks from; the slug is what we store. */
export const REPORT_TOPIC_OPTIONS = NEWS_TOPICS.filter(
  (topic) => topic.slug !== "india",
);

/** Old category labels and feed topics that predate this list. */
const LEGACY: Record<string, string> = {
  local: "community",
  alert: "crime",
  event: "events",
  other: "general",
  world: "general",
  tech: "business",
  bollywood: "entertainment",
  cricket: "sports",
};

export function topicSlug(value?: string | null) {
  if (!value) return "general";
  const key = value.trim().toLowerCase();
  if (BY_SLUG.has(key)) return key;
  return LEGACY[key] ?? "general";
}

export function topicOf(item: { topic?: string | null; category?: string | null }) {
  const fromTopic = topicSlug(item.topic);
  if (fromTopic !== "general") return fromTopic;
  return topicSlug(item.category);
}

export function topicLabel(slug: string) {
  const topic = BY_SLUG.get(topicSlug(slug));
  return topic ? `${topic.emoji} ${topic.label}` : "📰 General";
}
