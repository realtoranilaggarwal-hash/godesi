import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { recentChat } from "@/lib/chat";

export const dynamic = "force-dynamic";

/** Polled by the chat box every few seconds — cheap read, no cache. */
export async function GET() {
  const user = await getCurrentUser();
  const messages = await recentChat(user?.id ?? null);
  return NextResponse.json(
    { messages },
    { headers: { "cache-control": "no-store" } },
  );
}
