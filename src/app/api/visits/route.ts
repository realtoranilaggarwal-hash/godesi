import { NextResponse } from "next/server";
import { countVisit, visitTotals } from "@/lib/visits";

export const dynamic = "force-dynamic";

export async function GET() {
  const totals = await visitTotals();
  return NextResponse.json(totals, {
    headers: { "cache-control": "public, max-age=300" },
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    first?: boolean;
  } | null;
  const totals = await countVisit(body?.first === true);
  return NextResponse.json(totals, { headers: { "cache-control": "no-store" } });
}
