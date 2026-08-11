import { NextResponse } from "next/server";

/**
 * Turns coordinates into a city name through OpenStreetMap's Nominatim
 * service, so the report form can offer "use my location". Data © OpenStreetMap
 * contributors, ODbL.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const lat = Number(params.get("lat"));
  const lng = Number(params.get("lng"));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "Bad coordinates" }, { status: 400 });
  }

  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("zoom", "12");

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Godesi/1.0 (https://godesi.com)" },
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error("lookup failed");

    const data = (await res.json()) as {
      address?: Record<string, string>;
    };
    const address = data.address ?? {};

    return NextResponse.json({
      city:
        address.city ??
        address.town ??
        address.village ??
        address.suburb ??
        address.county ??
        null,
      state: address.state ?? null,
      country: address.country ?? null,
      attribution: "© OpenStreetMap contributors",
    });
  } catch {
    return NextResponse.json({ error: "Lookup failed" }, { status: 502 });
  }
}
