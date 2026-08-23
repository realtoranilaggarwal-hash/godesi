import { NextResponse } from "next/server";
import { currentUserId } from "@/lib/auth";
import { recentChat } from "@/lib/chat";

export const dynamic = "force-dynamic";

/**
 * Polled by the chat box. The lines come from a shared cache and the viewer is
 * read from the session cookie, so a poll costs no database query at all
 * unless the cache has expired.
 */
export async function GET() {
  const messages = await recentChat(await currentUserId());
  return NextResponse.json(
    { messages },
    { headers: { "cache-control": "no-store" } },
  );
}
