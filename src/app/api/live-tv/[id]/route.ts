import { NextResponse } from "next/server";
import { findTv } from "@/lib/liveMedia";
import { liveVideoId } from "@/lib/liveTv";

/** Lets the floating mini player pick up the channel's current live stream. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const channel = findTv(id);
  if (!channel) {
    return NextResponse.json({ error: "Unknown channel" }, { status: 404 });
  }
  return NextResponse.json({ videoId: await liveVideoId(channel) });
}
