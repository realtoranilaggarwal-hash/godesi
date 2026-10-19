import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { FEED_HEADERS } from "@/lib/publicEvents";
import { AGENT_SELECT, agentJson } from "@/lib/agentFeed";
import { LIFE_INSURANCE_AGENT_WHERE } from "@/lib/lifeInsuranceFeed";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } },
) {
  const ref = new URL(request.url).searchParams.get("ref")?.trim();
  const agent = await db.business.findFirst({
    where: { AND: [LIFE_INSURANCE_AGENT_WHERE, { slug: params.slug }] },
    select: AGENT_SELECT,
  });
  if (!agent) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404, headers: FEED_HEADERS },
    );
  }
  return NextResponse.json(agentJson(agent, ref || undefined), {
    headers: FEED_HEADERS,
  });
}
