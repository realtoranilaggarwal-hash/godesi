/** GoDesi Media: the umbrella for Desi Who's Who, news, podcast and clips. */
export const WHOS_WHO_YOUTUBE = "https://youtube.com/@desiwhoswho";

export const MEDIA_PROGRAMS = [
  {
    slug: "whos-who",
    icon: "🎙️",
    name: "Desi Who's Who",
    tag: "Flagship interview show",
    blurb:
      "One person. One story. One lesson. Entrepreneurs, doctors, realtors, artists, students, community leaders — anyone with a journey worth hearing.",
    href: "/desi-elite",
    cta: "Nominate yourself or someone",
  },
  {
    slug: "news",
    icon: "📰",
    name: "GoDesi News",
    tag: "Community news",
    blurb:
      "Local, business, immigration, consumer alerts, achievements. Facts first, verified, with member reporters across cities.",
    href: "/news",
    cta: "Read or post a story",
  },
  {
    slug: "podcast",
    icon: "🎧",
    name: "The GoDesi Podcast",
    tag: "Long-form conversations",
    blurb:
      "20–45 minutes with the people behind the businesses and the moves. How did you come here? What was your first job? What mistake taught you the most?",
    href: WHOS_WHO_YOUTUBE,
    cta: "Listen on YouTube",
  },
  {
    slug: "street",
    icon: "🎤",
    name: "Desi on the Street",
    tag: "Short-form",
    blurb:
      '"What do you miss most about India?" "Best desi food in New Jersey?" Sixty-second clips from the community for Shorts, Reels and TikTok.',
    href: WHOS_WHO_YOUTUBE,
    cta: "Watch the clips",
  },
  {
    slug: "spotlight",
    icon: "🏪",
    name: "Desi Business Spotlight",
    tag: "Business stories",
    blurb:
      "From a small kitchen to a busy restaurant. The story behind a business on GoDesi — the owner gets the exposure, customers discover the card.",
    href: "/desi-elite/apply",
    cta: "Put your business forward",
  },
] as const;

export const MEDIA_ROLES = [
  { id: "interviewer", label: "Interviewer / host" },
  { id: "videographer", label: "Camera & lighting" },
  { id: "editor", label: "Video editor (long-form + Shorts)" },
  { id: "writer", label: "Writer / news reporter" },
  { id: "social", label: "Social media & clips" },
  { id: "street", label: "Desi-on-the-Street roving reporter" },
  { id: "producer", label: "Producer / scheduling & guest outreach" },
] as const;

export const MEDIA_ROLE_IDS: string[] = MEDIA_ROLES.map((role) => role.id);

export const MEDIA_APPLICATION_STATUSES = [
  "NEW",
  "CONTACTED",
  "TRIAL",
  "ONBOARD",
  "DECLINED",
] as const;

/** One recording, a week of content. */
export const CONTENT_MULTIPLIER = [
  "1 full YouTube interview",
  "1 podcast episode",
  "5–10 YouTube Shorts",
  "Instagram Reels · Facebook clips · TikTok",
  "1 GoDesi News article",
  "Quote graphics",
  "Business / profile page on GoDesi",
];

export const FIRST_MARKETS = [
  "Iselin",
  "Edison",
  "Woodbridge",
  "Piscataway",
  "East Brunswick",
  "Monroe",
  "Jersey City",
  "Princeton",
];
