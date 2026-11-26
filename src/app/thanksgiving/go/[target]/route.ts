import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/format";
import { requestGeo } from "@/lib/geo";
import { newsPath } from "@/lib/newsLinks";
import {
  THANKSGIVING,
  THANKSGIVING_TARGETS,
  type ThanksgivingTarget,
} from "@/lib/thanksgiving";

export const dynamic = "force-dynamic";

const SOURCES = new Set(["turkey", "banner", "article", "page"]);

async function destination(target: ThanksgivingTarget) {
  if (target === "nye") return THANKSGIVING.nyeUrl;
  if (target === "marketing") return "/thanksgiving?offer=marketing#inquire";
  if (target === "website") return "/thanksgiving?offer=website#inquire";
  const article = await db.newsItem.findUnique({
    where: { guid: THANKSGIVING.articleGuid },
    select: { id: true, title: true },
  });
  return article ? newsPath(article) : "/thanksgiving";
}

/** Counts a Thanksgiving click, then forwards to the offer. */
export async function GET(
  request: Request,
  { params }: { params: { target: string } },
) {
  const target = THANKSGIVING_TARGETS.find((t) => t === params.target);
  if (!target) return NextResponse.redirect(siteUrl(), { status: 302 });
  const from = new URL(request.url).searchParams.get("from") ?? "";

  await db.promoEvent
    .create({
      data: {
        campaign: THANKSGIVING.campaign,
        kind: "click",
        target,
        source: SOURCES.has(from) ? from : null,
        city: requestGeo().city,
      },
    })
    .catch(() => null);

  return NextResponse.redirect(new URL(await destination(target), siteUrl()), {
    status: 302,
  });
}
