import { NextResponse } from "next/server";
import { howItWorks } from "@/lib/eventsHowItWorks";
import { FEED_HEADERS } from "@/lib/publicEvents";

export const dynamic = "force-dynamic";

/**
 * The organiser pitch as data, so eventringer.com can render its own
 * "list your event" page without the prices drifting from ours.
 */
export async function GET() {
  return NextResponse.json(howItWorks(), { headers: FEED_HEADERS });
}
