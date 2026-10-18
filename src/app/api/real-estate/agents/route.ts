import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { FEED_HEADERS } from "@/lib/publicEvents";
import {
  AGENT_SELECT,
  REAL_ESTATE_AGENT_WHERE,
  agentJson,
} from "@/lib/realEstateFeed";

export const dynamic = "force-dynamic";

/**
 * Public read-only list of real estate agent cards for Godesi's own
 * directory sites (realestateyp.com). Claims, edits and payments stay on
 * godesi.com through the `godesiUrl` on every item.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const limit = Math.min(
    Math.max(Number(params.get("limit") ?? 48) || 48, 1),
    200,
  );
  const skip = Math.max(Number(params.get("offset") ?? 0) || 0, 0);
  const city = params.get("city")?.trim() || undefined;
  const state = params.get("state")?.trim() || undefined;
  const query = params.get("q")?.trim() || undefined;
  const ref = params.get("ref")?.trim() || undefined;

  const where: Prisma.BusinessWhereInput = {
    AND: [
      REAL_ESTATE_AGENT_WHERE,
      city ? { city: { equals: city, mode: "insensitive" } } : {},
      state ? { state: { equals: state, mode: "insensitive" } } : {},
      query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { city: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
            ],
          }
        : {},
    ],
  };

  const [agents, total] = await Promise.all([
    db.business.findMany({
      where,
      orderBy: [{ featuredRank: "desc" }, { updatedAt: "desc" }],
      take: limit,
      skip,
      select: AGENT_SELECT,
    }),
    db.business.count({ where }),
  ]);

  const facets =
    params.get("facets") === "1"
      ? {
          cities: (
            await db.business.groupBy({
              by: ["city", "state"],
              where: REAL_ESTATE_AGENT_WHERE,
              _count: { _all: true },
              orderBy: { _count: { city: "desc" } },
              take: 100,
            })
          ).map((row) => ({
            city: row.city,
            state: row.state,
            count: row._count._all,
          })),
        }
      : {};

  return NextResponse.json(
    { total, items: agents.map((agent) => agentJson(agent, ref)), ...facets },
    { headers: FEED_HEADERS },
  );
}
