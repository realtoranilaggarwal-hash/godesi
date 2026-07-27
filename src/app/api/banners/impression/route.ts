import { NextResponse } from "next/server";
import { countImpression } from "@/lib/banners";

export async function POST(request: Request) {
  const { id } = (await request.json().catch(() => ({}))) as { id?: string };
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  await countImpression(id);

  return new NextResponse(null, { status: 204 });
}
