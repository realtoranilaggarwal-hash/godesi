import { NextResponse } from "next/server";
import { siteUrl } from "@/lib/format";
import { properName } from "@/lib/names";
import { chatterPath, chatterThread } from "@/lib/chatter";
import { CHATTER_FEED_HEADERS, chatterJson } from "@/lib/publicChatter";

export const dynamic = "force-dynamic";

/** One visible Chatter post with its visible replies, oldest reply first. */
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const ref =
    new URL(request.url).searchParams.get("ref")?.trim().slice(0, 40) ||
    undefined;
  const thread = await chatterThread(params.id);

  if (!thread) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404, headers: CHATTER_FEED_HEADERS },
    );
  }

  const { parent, ...post } = thread.post;
  return NextResponse.json(
    {
      post: chatterJson(post, ref),
      parent: parent
        ? {
            id: parent.id,
            author: properName(parent.author.name),
            url: `${siteUrl()}${chatterPath(parent.id)}${
              ref ? `?ref=${encodeURIComponent(ref)}` : ""
            }`,
          }
        : null,
      replies: thread.replies.map((reply) => chatterJson(reply, ref)),
    },
    { headers: CHATTER_FEED_HEADERS },
  );
}
