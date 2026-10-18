import { siteUrl } from "@/lib/format";
import { properName } from "@/lib/names";
import { chatterPath, topicOf, type ChatterPostRow } from "@/lib/chatter";

export const CHATTER_FEED_HEADERS = {
  "access-control-allow-origin": "*",
  "cache-control": "public, s-maxage=120, stale-while-revalidate=600",
};

function absolute(url: string | null) {
  if (!url) return null;
  return url.startsWith("/") ? `${siteUrl()}${url}` : url;
}

/** A visible Chatter post as the public API returns it, with GoDesi links attached. */
export function chatterJson(post: ChatterPostRow, ref?: string) {
  const query = ref ? `?ref=${encodeURIComponent(ref)}` : "";
  const topic = topicOf(post.topic);
  return {
    id: post.id,
    body: post.body,
    imageUrl: absolute(post.imageUrl),
    topic: { id: topic.id, label: topic.label, emoji: topic.emoji },
    city: post.city,
    language: post.language,
    tags: post.tags,
    parentId: post.parentId,
    likeCount: post.likeCount,
    replyCount: post.replyCount,
    createdAt: post.createdAt.toISOString(),
    editedAt: post.editedAt?.toISOString() ?? null,
    author: {
      name: properName(post.author.name),
      username: post.author.username,
      avatarUrl: absolute(post.author.avatarUrl),
      url: post.author.username
        ? `${siteUrl()}/${post.author.username}${query}`
        : null,
    },
    url: `${siteUrl()}${chatterPath(post.id)}${query}`,
  };
}
