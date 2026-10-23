import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { FEED_HEADERS } from "@/lib/publicEvents";
import {
  PROPERTY_INCLUDE,
  PROPERTY_WHERE,
  propertyJson,
} from "@/lib/realEstateFeed";

export const dynamic = "force-dynamic";

/** Public read-only list of member-posted properties for sale or rent. */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const limit = Math.min(
    Math.max(Math.floor(Number(params.get("limit") ?? 24) || 24), 1),
    100,
  );
  const skip = Math.max(Math.floor(Number(params.get("offset") ?? 0) || 0), 0);
  const city = params.get("city")?.trim() || undefined;
  const kind = params.get("kind");
  const ref = params.get("ref")?.trim() || undefined;

  const where: Prisma.ListingWhereInput = {
    AND: [
      PROPERTY_WHERE,
      city ? { city: { equals: city, mode: "insensitive" } } : {},
      kind === "sale"
        ? { kind: "PROPERTY_SALE" }
        : kind === "rent"
          ? { kind: "PROPERTY_RENT" }
          : {},
    ],
  };

  const [listings, total] = await Promise.all([
    db.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
      include: PROPERTY_INCLUDE,
    }),
    db.listing.count({ where }),
  ]);

  return NextResponse.json(
    { total, items: listings.map((listing) => propertyJson(listing, ref)) },
    { headers: FEED_HEADERS },
  );
}
