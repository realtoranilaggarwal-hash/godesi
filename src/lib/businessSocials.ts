/** Social/profile links a business can add — drives the form and the profile page. */
export const BUSINESS_SOCIALS = [
  { key: "websiteUrl", label: "Website", icon: "🌐", placeholder: "https://yourbusiness.com" },
  { key: "instagramUrl", label: "Instagram", icon: "📸", placeholder: "https://instagram.com/yourhandle" },
  { key: "facebookUrl", label: "Facebook", icon: "📘", placeholder: "https://facebook.com/yourpage" },
  { key: "youtubeUrl", label: "YouTube", icon: "▶️", placeholder: "https://youtube.com/@yourchannel" },
  { key: "linkedinUrl", label: "LinkedIn", icon: "💼", placeholder: "https://linkedin.com/in/you" },
  { key: "xUrl", label: "X (Twitter)", icon: "✖️", placeholder: "https://x.com/yourhandle" },
  { key: "tiktokUrl", label: "TikTok", icon: "🎵", placeholder: "https://tiktok.com/@yourhandle" },
  { key: "threadsUrl", label: "Threads", icon: "🧵", placeholder: "https://threads.net/@yourhandle" },
  { key: "telegramUrl", label: "Telegram", icon: "✈️", placeholder: "https://t.me/yourchannel" },
  {
    key: "whatsappChannelUrl",
    label: "WhatsApp channel or group",
    icon: "💬",
    placeholder: "https://whatsapp.com/channel/…",
  },
  { key: "pinterestUrl", label: "Pinterest", icon: "📌", placeholder: "https://pinterest.com/you" },
  { key: "snapchatUrl", label: "Snapchat", icon: "👻", placeholder: "https://snapchat.com/add/you" },
  { key: "linktreeUrl", label: "Linktree", icon: "🌳", placeholder: "https://linktr.ee/yourname" },
  { key: "alignableUrl", label: "Alignable", icon: "🤝", placeholder: "https://alignable.com/your-town/your-business" },
  { key: "mapsUrl", label: "Google Maps / Business", icon: "📍", placeholder: "https://maps.app.goo.gl/…" },
  { key: "yelpUrl", label: "Yelp", icon: "⭐", placeholder: "https://yelp.com/biz/…" },
  {
    key: "googleReviewUrl",
    label: "Review us on Google",
    icon: "✍️",
    placeholder: "https://g.page/r/…/review",
  },
  {
    key: "reviewsUrl",
    label: "Read our reviews",
    icon: "⭐",
    placeholder: "https://trustindex.io/reviews/yourwebsite.com",
  },
  { key: "zillowUrl", label: "Zillow profile", icon: "🏡", placeholder: "https://zillow.com/profile/…" },
  { key: "realtorUrl", label: "Realtor.com profile", icon: "🏘️", placeholder: "https://realtor.com/realestateagents/…" },
  { key: "homesUrl", label: "Homes.com profile", icon: "🏠", placeholder: "https://homes.com/real-estate-agents/…" },
  // Music platforms — the form only asks these on DJ / band / singer listings.
  { key: "soundcloudUrl", label: "SoundCloud", icon: "☁️", placeholder: "https://soundcloud.com/yourdjname" },
  { key: "spotifyUrl", label: "Spotify", icon: "🎧", placeholder: "https://open.spotify.com/artist/…" },
  { key: "mixcloudUrl", label: "Mixcloud", icon: "🎚️", placeholder: "https://mixcloud.com/yourdjname" },
  { key: "beatportUrl", label: "Beatport", icon: "🎛️", placeholder: "https://beatport.com/artist/…" },
  { key: "twitchUrl", label: "Twitch", icon: "📺", placeholder: "https://twitch.tv/yourchannel" },
] as const;

export type BusinessSocialKey = (typeof BUSINESS_SOCIALS)[number]["key"];

/** Music-platform link keys — the form only asks these on performer listings. */
export const MUSIC_SOCIAL_KEYS: readonly BusinessSocialKey[] = [
  "soundcloudUrl",
  "spotifyUrl",
  "mixcloudUrl",
  "beatportUrl",
  "twitchUrl",
];

/**
 * Subcategories that book performers — the only listings where music links
 * and a "Book me" prompt make sense. DJ & Sound aliases (Stage & Sound
 * Rentals, Dhol & Baraat) and the music Anchors & Artists subs are included.
 */
export const MUSIC_SUBCATEGORY_SLUGS = [
  "events-wedding-dj-and-sound",
  "events-wedding-stage-and-sound-rentals",
  "events-wedding-dhol-and-baraat",
  "events-wedding-live-bands",
  "events-wedding-singers",
] as const;

export function isMusicSubcategory(slug?: string | null) {
  return slug
    ? (MUSIC_SUBCATEGORY_SLUGS as readonly string[]).includes(slug)
    : false;
}
