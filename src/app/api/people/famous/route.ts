import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { searchFamousPeople } from "@/lib/famousPeople";

export const dynamic = "force-dynamic";

/** "Is this speaker a well-known person?" suggestions for event organisers. */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ famous: [] }, { status: 401 });
  const q = (new URL(request.url).searchParams.get("q") ?? "").slice(0, 80);
  try {
    return NextResponse.json({ famous: await searchFamousPeople(q) });
  } catch {
    return NextResponse.json({ famous: [] });
  }
}
