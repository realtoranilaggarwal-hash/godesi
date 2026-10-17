import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { CONTENT_TTL, cachedQuery } from "@/lib/cache";

export const CHATTER_MAX = 500;
export const CHATTER_PAGE = 20;

/** Posts a member may make in the window before being asked to slow down. */
export const CHATTER_RATE = [
  { windowMs: 10 * 60 * 1000, max: 5, label: "10 minutes" },
  { windowMs: 24 * 60 * 60 * 1000, max: 40, label: "day" },
] as const;

/** Distinct reporters after which a post is hidden until staff review it. */
export const CHATTER_AUTO_HIDE_REPORTS = 3;

export const CHATTER_TOPICS = [
  { id: "general", label: "General chatter", emoji: "💬" },
  { id: "local", label: "Local community", emoji: "📍" },
  { id: "food", label: "Food", emoji: "🍛" },
  { id: "cricket", label: "Cricket & sports", emoji: "🏏" },
  { id: "bollywood", label: "Bollywood & entertainment", emoji: "🎬" },
  { id: "jobs", label: "Jobs & careers", emoji: "💼" },
  { id: "business", label: "Business", emoji: "🏪" },
  { id: "relationships", label: "Family & relationships", emoji: "❤️" },
  { id: "travel", label: "Travel & visa", emoji: "✈️" },
  { id: "culture", label: "Culture & festivals", emoji: "🪔" },
] as const;

export type ChatterTopicId = (typeof CHATTER_TOPICS)[number]["id"];

export const CHATTER_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी Hindi" },
  { code: "pa", label: "ਪੰਜਾਬੀ Punjabi" },
  { code: "gu", label: "ગુજરાતી Gujarati" },
  { code: "bn", label: "বাংলা Bengali" },
  { code: "ta", label: "தமிழ் Tamil" },
  { code: "te", label: "తెలుగు Telugu" },
  { code: "mr", label: "मराठी Marathi" },
  { code: "ur", label: "اردو Urdu" },
  { code: "ml", label: "മലയാളം Malayalam" },
  { code: "kn", label: "ಕನ್ನಡ Kannada" },
] as const;

export function isChatterTopic(value: string): value is ChatterTopicId {
  return CHATTER_TOPICS.some((topic) => topic.id === value);
}

export function topicOf(id: string) {
  return CHATTER_TOPICS.find((topic) => topic.id === id) ?? CHATTER_TOPICS[0];
}

export function isChatterLanguage(value: string) {
  return CHATTER_LANGUAGES.some((language) => language.code === value);
}

/** Latin, accented Latin, Arabic/Urdu and the Indic scripts, plus digits and _. */
const WORD = "A-Za-z0-9_\\u00C0-\\u024F\\u0600-\\u06FF\\u0900-\\u0DFF";

function hashtagPattern() {
  return new RegExp(`(^|[^${WORD}&])#([${WORD}]{2,40})`, "g");
}

/** Lower-case #words in a post, without the #, first ten only. */
export function extractHashtags(body: string) {
  const tags = new Set<string>();
  const pattern = hashtagPattern();
  const text = body.replace(/https?:\/\/\S+/g, " ");
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) && tags.size < 10) {
    if (/^\d+$/.test(match[2])) continue;
    tags.add(match[2].toLowerCase());
  }
  return Array.from(tags);
}

/** Free Google Translate page for the post, into the visitor's language. */
export function translateLink(body: string, target = "en") {
  const params = new URLSearchParams({
    sl: "auto",
    tl: target,
    text: body,
    op: "translate",
  });
  return `https://translate.google.com/?${params}`;
}

export function chatterPath(id: string) {
  return `/chatter/${id}`;
}

export const chatterAuthorSelect = {
  id: true,
  name: true,
  username: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

const postSelect = {
  id: true,
  body: true,
  imageUrl: true,
  topic: true,
  city: true,
  language: true,
  tags: true,
  parentId: true,
  likeCount: true,
  replyCount: true,
  editedAt: true,
  createdAt: true,
  author: { select: chatterAuthorSelect },
} satisfies Prisma.ChatterPostSelect;

export type ChatterPostRow = Prisma.ChatterPostGetPayload<{
  select: typeof postSelect;
}>;

/** Cache-safe copy: dates travel as ISO strings. */
type StoredPost = Omit<ChatterPostRow, "createdAt" | "editedAt"> & {
  createdAt: string;
  editedAt: string | null;
};

function store(post: ChatterPostRow): StoredPost {
  return {
    ...post,
    createdAt: post.createdAt.toISOString(),
    editedAt: post.editedAt?.toISOString() ?? null,
  };
}

function revive(post: StoredPost): ChatterPostRow {
  return {
    ...post,
    createdAt: new Date(post.createdAt),
    editedAt: post.editedAt ? new Date(post.editedAt) : null,
  };
}

export type FeedFilter = {
  topic?: string;
  city?: string;
  tag?: string;
  /** ISO time of the oldest post already shown; older posts come next. */
  before?: string;
};

function feedWhere(filter: FeedFilter): Prisma.ChatterPostWhereInput {
  const before = filter.before ? new Date(filter.before) : null;
  return {
    parentId: null,
    hiddenAt: null,
    author: { bannedAt: null },
    ...(filter.topic && isChatterTopic(filter.topic)
      ? { topic: filter.topic }
      : {}),
    ...(filter.city
      ? { city: { equals: filter.city, mode: "insensitive" as const } }
      : {}),
    ...(filter.tag ? { tags: { has: filter.tag.toLowerCase() } } : {}),
    ...(before && !Number.isNaN(before.getTime())
      ? { createdAt: { lt: before } }
      : {}),
  };
}

async function publicFeed(key: string) {
  const filter = JSON.parse(key) as FeedFilter;
  const posts = await db.chatterPost.findMany({
    where: feedWhere(filter),
    orderBy: { createdAt: "desc" },
    take: CHATTER_PAGE + 1,
    select: postSelect,
  });
  return posts.map(store);
}

const cachedFeed = cachedQuery("chatter-feed", CONTENT_TTL, publicFeed);

function page(posts: ChatterPostRow[]) {
  const more = posts.length > CHATTER_PAGE;
  const shown = posts.slice(0, CHATTER_PAGE);
  return {
    posts: shown,
    nextBefore: more ? shown[shown.length - 1].createdAt.toISOString() : null,
  };
}

/** One page of top-level posts, newest first; shared by every visitor. */
export async function chatterFeed(filter: FeedFilter) {
  const key = JSON.stringify({
    topic: filter.topic || undefined,
    city: filter.city?.trim().toLowerCase() || undefined,
    tag: filter.tag?.replace(/^#/, "").toLowerCase() || undefined,
    before: filter.before || undefined,
  });
  const stored = (await cachedFeed(key)) ?? [];
  return page(stored.map(revive));
}

/** Posts from the members this viewer follows. Per-viewer, so never cached. */
export async function followingFeed(viewerId: string, filter: FeedFilter) {
  const posts = await db.chatterPost.findMany({
    where: {
      ...feedWhere(filter),
      author: {
        bannedAt: null,
        chatterFollowers: { some: { followerId: viewerId } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: CHATTER_PAGE + 1,
    select: postSelect,
  });
  return page(posts);
}

/** A post with its visible replies, oldest reply first. */
export async function chatterThread(id: string) {
  const post = await db.chatterPost.findFirst({
    where: { id, hiddenAt: null, author: { bannedAt: null } },
    select: {
      ...postSelect,
      parent: {
        select: {
          id: true,
          body: true,
          hiddenAt: true,
          author: { select: chatterAuthorSelect },
        },
      },
    },
  });
  if (!post) return null;
  const replies = await db.chatterPost.findMany({
    where: { parentId: id, hiddenAt: null, author: { bannedAt: null } },
    orderBy: { createdAt: "asc" },
    take: 200,
    select: postSelect,
  });
  return { post, replies };
}

/** What the signed-in viewer has liked, follows and blocks among these authors. */
export async function viewerState(
  viewerId: string | null,
  posts: ChatterPostRow[],
) {
  if (!viewerId || posts.length === 0) {
    return {
      liked: new Set<string>(),
      following: new Set<string>(),
      blocked: new Set<string>(),
    };
  }
  const postIds = posts.map((post) => post.id);
  const authorIds = Array.from(new Set(posts.map((post) => post.author.id)));
  const [likes, follows, blocks] = await Promise.all([
    db.chatterLike.findMany({
      where: { userId: viewerId, postId: { in: postIds } },
      select: { postId: true },
    }),
    db.chatterFollow.findMany({
      where: { followerId: viewerId, followingId: { in: authorIds } },
      select: { followingId: true },
    }),
    db.chatterBlock.findMany({
      where: { blockerId: viewerId },
      select: { blockedId: true },
    }),
  ]);
  return {
    liked: new Set(likes.map((like) => like.postId)),
    following: new Set(follows.map((follow) => follow.followingId)),
    blocked: new Set(blocks.map((block) => block.blockedId)),
  };
}

async function recentTags() {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const posts = await db.chatterPost.findMany({
    where: {
      hiddenAt: null,
      createdAt: { gte: since },
      NOT: { tags: { isEmpty: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 400,
    select: { tags: true },
  });
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return Array.from(counts, ([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, 15);
}

/** #words used most on Chatter in the last week. */
export const trendingChatterTags = cachedQuery(
  "chatter-tags",
  CONTENT_TTL * 5,
  recentTags,
);

/** Short plain-text summary for titles and share text. */
export function chatterExcerpt(body: string, length = 70) {
  const flat = body.replace(/\s+/g, " ").trim();
  return flat.length > length ? `${flat.slice(0, length - 1)}…` : flat;
}

/** "5m", "3h", "2d", then a short date. */
export function chatterAge(date: Date, now = Date.now()) {
  const minutes = Math.max(0, Math.floor((now - date.getTime()) / 60000));
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export type BodyPart =
  | { kind: "text"; text: string }
  | { kind: "link"; text: string; href: string }
  | { kind: "tag"; text: string; tag: string };

/** Splits a post into plain text, web links and #words for rendering. */
export function bodyParts(body: string): BodyPart[] {
  const parts: BodyPart[] = [];
  const token = new RegExp(
    `(https?:\\/\\/[^\\s<>"]+)|(^|[^${WORD}&])#([${WORD}]{2,40})`,
    "g",
  );
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = token.exec(body))) {
    if (match[1]) {
      const href = match[1].replace(/[.,!?;:)]+$/, "");
      if (match.index > last) {
        parts.push({ kind: "text", text: body.slice(last, match.index) });
      }
      parts.push({ kind: "link", text: href, href });
      last = match.index + href.length;
      token.lastIndex = last;
      continue;
    }
    const start = match.index + match[2].length;
    if (start > last)
      parts.push({ kind: "text", text: body.slice(last, start) });
    parts.push({
      kind: "tag",
      text: `#${match[3]}`,
      tag: match[3].toLowerCase(),
    });
    last = start + match[3].length + 1;
  }
  if (last < body.length) parts.push({ kind: "text", text: body.slice(last) });
  return parts;
}
