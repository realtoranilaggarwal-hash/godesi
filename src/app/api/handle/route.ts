import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizeUsername, usernameError } from "@/lib/profiles";

export const dynamic = "force-dynamic";

/** Live availability for the "claim godesi.com/yourname" box on the homepage. */
export async function GET(request: Request) {
  const asked = new URL(request.url).searchParams.get("u") ?? "";
  const username = normalizeUsername(asked);
  if (!username) {
    return NextResponse.json({ username, state: "empty" as const });
  }

  const invalid = usernameError(username);
  if (invalid) {
    return NextResponse.json({
      username,
      state: "invalid" as const,
      message: invalid,
    });
  }

  const taken = await db.user.findUnique({
    where: { username },
    select: { id: true },
  });

  return NextResponse.json({
    username,
    state: taken ? ("taken" as const) : ("free" as const),
  });
}
