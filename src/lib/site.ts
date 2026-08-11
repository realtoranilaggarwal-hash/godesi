/**
 * Public contact and social handles. Empty values are simply not rendered,
 * so links can be filled in one at a time as accounts go live.
 */
export const SITE = {
  name: "Godesi",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "admin@godesi.com",
  salesEmail: process.env.NEXT_PUBLIC_SALES_EMAIL ?? "sales@godesi.com",
};

/** The public GoDesi community group — announcements, jobs, events, chat. */
export const TELEGRAM_GROUP =
  process.env.NEXT_PUBLIC_SOCIAL_TELEGRAM ?? "https://t.me/godesicommunity";

export const TELEGRAM_HANDLE = "@godesicommunity";

export type SocialLink = {
  key: string;
  label: string;
  icon: string;
  url: string;
};

const SOCIAL_ENV: Omit<SocialLink, "url">[] = [
  { key: "facebook", label: "Facebook", icon: "📘" },
  { key: "instagram", label: "Instagram", icon: "📸" },
  { key: "youtube", label: "YouTube", icon: "▶️" },
  { key: "x", label: "X (Twitter)", icon: "𝕏" },
  { key: "linkedin", label: "LinkedIn", icon: "in" },
  { key: "telegram", label: "Telegram", icon: "✈️" },
  { key: "whatsapp", label: "WhatsApp", icon: "💬" },
];

const URLS: Record<string, string | undefined> = {
  facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK,
  instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM,
  youtube: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE,
  x: process.env.NEXT_PUBLIC_SOCIAL_X,
  linkedin: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN,
  telegram: TELEGRAM_GROUP,
  whatsapp: process.env.NEXT_PUBLIC_SOCIAL_WHATSAPP,
};

export function socialLinks(): SocialLink[] {
  return SOCIAL_ENV.flatMap((social) => {
    const url = URLS[social.key]?.trim();
    return url ? [{ ...social, url }] : [];
  });
}
