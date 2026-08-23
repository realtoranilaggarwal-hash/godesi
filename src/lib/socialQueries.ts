/**
 * The database half of social.ts — the labels and helpers next door are safe for client components, but a module that touches Prisma cannot be bundled for the browser.
 */

import { db } from "@/lib/db";
import { SocialWallPost } from "@/lib/social";

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
