import { NextResponse } from "next/server";
import { searchStations } from "@/lib/radioBrowser";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const stations = await searchStations({
    query: url.searchParams.get("q")?.slice(0, 60) || undefined,
    country: url.searchParams.get("country")?.slice(0, 2).toUpperCase() || undefined,
  });
  return NextResponse.json({ stations });
}
