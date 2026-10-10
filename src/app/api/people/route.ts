import { NextResponse } from "next/server";
import { findProfilesByName } from "@/lib/peopleLookup";

export const dynamic = "force-dynamic";

/** Live "is this person already on GoDesi?" lookup for speaker pickers. */
export async function GET(request: Request) {
  const q = (new URL(request.url).searchParams.get("q") ?? "").slice(0, 80);
  const matches = await findProfilesByName(q);
  return NextResponse.json({ matches });
}
