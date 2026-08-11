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
  { key: "mapsUrl", label: "Google Maps / Business", icon: "📍", placeholder: "https://maps.app.goo.gl/…" },
  { key: "yelpUrl", label: "Yelp", icon: "⭐", placeholder: "https://yelp.com/biz/…" },
  { key: "zillowUrl", label: "Zillow profile", icon: "🏡", placeholder: "https://zillow.com/profile/…" },
  { key: "realtorUrl", label: "Realtor.com profile", icon: "🏘️", placeholder: "https://realtor.com/realestateagents/…" },
] as const;

export type BusinessSocialKey = (typeof BUSINESS_SOCIALS)[number]["key"];
