import { NextResponse } from "next/server";
import {
  CHATTER_TOPICS,
  chatterFeed,
  isChatterTopic,
  trendingChatterTags,
} from "@/lib/chatter";
import { CHATTER_FEED_HEADERS, chatterJson } from "@/lib/publicChatter";

export const dynamic = "force-dynamic";

/**
 * Public read-only Chatter feed for GoDesi's satellite sites (gapodi.com).
 * Same visible posts as godesi.com/chatter; posting, replies and likes stay
 * on godesi.com through the `url` on every item.
 */
function text(params: URLSearchParams, name: string, max: number) {
  const value = params.get(name)?.trim();
  return value && value.length <= max ? value : undefined;
}

function isoTime(value: string | null) {
  const time = value ? new Date(value) : null;
  return time && !Number.isNaN(time.getTime()) ? time.toISOString() : undefined;
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const ref = text(params, "ref", 40);
  const topic = params.get("topic")?.trim();
  const [feed, tags] = await Promise.all([
    chatterFeed({
      topic: topic && isChatterTopic(topic) ? topic : undefined,
      city: text(params, "city", 60),
      tag: text(params, "tag", 41),
      before: isoTime(params.get("before")),
    }),
    trendingChatterTags(),
  ]);

  return NextResponse.json(
    {
      items: feed.posts.map((post) => chatterJson(post, ref)),
      nextBefore: feed.nextBefore,
      trending: tags ?? [],
      topics: CHATTER_TOPICS.map(({ id, label, emoji }) => ({
        id,
        label,
        emoji,
      })),
    },
    { headers: CHATTER_FEED_HEADERS },
  );
}
