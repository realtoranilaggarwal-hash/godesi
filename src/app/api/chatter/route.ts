import { NextResponse } from "next/server";
import {
  CHATTER_TOPICS,
  chatterFeed,
  trendingChatterTags,
} from "@/lib/chatter";
import { CHATTER_FEED_HEADERS, chatterJson } from "@/lib/publicChatter";

export const dynamic = "force-dynamic";

/**
 * Public read-only Chatter feed for GoDesi's satellite sites (gapodi.com).
 * Same visible posts as godesi.com/chatter; posting, replies and likes stay
 * on godesi.com through the `url` on every item.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const ref = params.get("ref")?.trim() || undefined;
  const [feed, tags] = await Promise.all([
    chatterFeed({
      topic: params.get("topic")?.trim() || undefined,
      city: params.get("city")?.trim() || undefined,
      tag: params.get("tag")?.trim() || undefined,
      before: params.get("before")?.trim() || undefined,
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
