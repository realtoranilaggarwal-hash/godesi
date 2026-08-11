/** Social links a member can publish on their personal about-me profile. */
export const PERSONAL_SOCIALS = [
  { key: "websiteUrl", label: "Website / portfolio", icon: "🌐", placeholder: "https://yoursite.com" },
  { key: "linkedinUrl", label: "LinkedIn", icon: "💼", placeholder: "https://linkedin.com/in/you" },
  { key: "instagramUrl", label: "Instagram", icon: "📸", placeholder: "https://instagram.com/you" },
  { key: "facebookUrl", label: "Facebook", icon: "📘", placeholder: "https://facebook.com/you" },
  { key: "youtubeUrl", label: "YouTube", icon: "▶️", placeholder: "https://youtube.com/@you" },
  { key: "xUrl", label: "X (Twitter)", icon: "✖️", placeholder: "https://x.com/you" },
  { key: "tiktokUrl", label: "TikTok", icon: "🎵", placeholder: "https://tiktok.com/@you" },
  { key: "threadsUrl", label: "Threads", icon: "🧵", placeholder: "https://threads.net/@you" },
  { key: "telegramUrl", label: "Telegram", icon: "✈️", placeholder: "https://t.me/you" },
  { key: "pinterestUrl", label: "Pinterest", icon: "📌", placeholder: "https://pinterest.com/you" },
  { key: "snapchatUrl", label: "Snapchat", icon: "👻", placeholder: "https://snapchat.com/add/you" },
  { key: "githubUrl", label: "GitHub", icon: "🐙", placeholder: "https://github.com/you" },
] as const;

export type PersonalSocialKey = (typeof PERSONAL_SOCIALS)[number]["key"];

/** Comma or newline separated input becomes a clean, de-duplicated list. */
export function splitTags(value: string, max = 20) {
  const seen = new Set<string>();
  for (const item of value.split(/[,\n]/)) {
    const clean = item.trim().slice(0, 40);
    if (clean) seen.add(clean);
    if (seen.size >= max) break;
  }
  return Array.from(seen);
}

/** One URL per line, keeping only what we can embed. */
export function splitLines(value: string, max = 5) {
  return value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, max);
}
