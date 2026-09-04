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

/** The GoDesi Space on Quora. */
export const QUORA_SPACE =
  process.env.NEXT_PUBLIC_SOCIAL_QUORA ?? "https://qr.ae/pFaPVe";

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
  { key: "quora", label: "Quora", icon: "Q" },
];

const URLS: Record<string, string | undefined> = {
  facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK,
  instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM,
  youtube: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE,
  x: process.env.NEXT_PUBLIC_SOCIAL_X,
  linkedin: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN,
  telegram: TELEGRAM_GROUP,
  whatsapp: process.env.NEXT_PUBLIC_SOCIAL_WHATSAPP,
  quora: QUORA_SPACE,
};

export function socialLinks(): SocialLink[] {
  return SOCIAL_ENV.flatMap((social) => {
    const url = URLS[social.key]?.trim();
    return url ? [{ ...social, url }] : [];
  });
}
