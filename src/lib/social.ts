import type { SocialPlatform } from "@prisma/client";
import { db } from "@/lib/db";

export const SOCIAL_TAG = "godesi";

export const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  X: "X",
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  LINKEDIN: "LinkedIn",
  YOUTUBE: "YouTube",
  THREADS: "Threads",
};

export const PLATFORM_ICONS: Record<SocialPlatform, string> = {
  X: "𝕏",
  INSTAGRAM: "📸",
  FACEBOOK: "f",
  LINKEDIN: "in",
  YOUTUBE: "▶",
  THREADS: "@",
};

/** Where "see every #godesi post" goes for each network. */
export const HASHTAG_LINKS: Record<SocialPlatform, string> = {
  X: `https://x.com/hashtag/${SOCIAL_TAG}`,
  INSTAGRAM: `https://www.instagram.com/explore/tags/${SOCIAL_TAG}/`,
  FACEBOOK: `https://www.facebook.com/hashtag/${SOCIAL_TAG}`,
  LINKEDIN: `https://www.linkedin.com/feed/hashtag/?keywords=${SOCIAL_TAG}`,
  YOUTUBE: `https://www.youtube.com/hashtag/${SOCIAL_TAG}`,
  THREADS: `https://www.threads.net/search?q=%23${SOCIAL_TAG}`,
};

export type SocialWallPost = {
  id: string;
  platform: SocialPlatform;
  url: string;
  author: string;
  handle: string | null;
  avatarUrl: string | null;
  text: string;
  imageUrl: string | null;
  postedAt: Date;
};

/** Curated posts for the wall, newest or lowest position first. */
export async function socialWallPosts(limit = 6): Promise<SocialWallPost[]> {
  return db.socialPost.findMany({
    where: { active: true },
    orderBy: [{ position: "asc" }, { postedAt: "desc" }],
    take: limit,
    select: {
      id: true,
      platform: true,
      url: true,
      author: true,
      handle: true,
      avatarUrl: true,
      text: true,
      imageUrl: true,
      postedAt: true,
    },
  });
}

/** Guesses the network from a pasted post link, so staff only paste the URL. */
export function platformFromUrl(url: string): SocialPlatform {
  const host = (() => {
    try {
      return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    } catch {
      return "";
    }
  })();
  if (host.endsWith("instagram.com")) return "INSTAGRAM";
  if (host.endsWith("facebook.com") || host.endsWith("fb.com")) return "FACEBOOK";
  if (host.endsWith("linkedin.com")) return "LINKEDIN";
  if (host.endsWith("youtube.com") || host.endsWith("youtu.be")) return "YOUTUBE";
  if (host.endsWith("threads.net")) return "THREADS";
  return "X";
}

/** Pulls `@handle` out of an X or Instagram post URL when staff leave it blank. */
export function handleFromUrl(url: string): string | null {
  try {
    const parts = new URL(url).pathname.split("/").filter(Boolean);
    const first = parts[0];
    if (!first || ["p", "reel", "posts", "hashtag", "watch", "shorts"].includes(first)) {
      return null;
    }
    return `@${first.replace(/^@/, "")}`;
  } catch {
    return null;
  }
}

export function shortTime(date: Date) {
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 60) return `${Math.max(minutes, 1)}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  return days < 30 ? `${days}d` : `${Math.round(days / 30)}mo`;
}
