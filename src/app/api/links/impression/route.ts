import { NextResponse } from "next/server";
import { countLinkImpression } from "@/lib/resources";

export async function POST(request: Request) {
  const { ids } = (await request.json().catch(() => ({}))) as { ids?: unknown };
  if (!Array.isArray(ids)) {
    return NextResponse.json({ error: "ids is required" }, { status: 400 });
  }

  const unique = Array.from(
    new Set(ids.filter((id): id is string => typeof id === "string").slice(0, 10)),
  );
  await Promise.all(unique.map((id) => countLinkImpression(id)));

  return new NextResponse(null, { status: 204 });
}
