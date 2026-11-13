import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cachedQuery, CONTENT_TTL } from "@/lib/cache";
import { emptyTally, type DesignTally, type DesignVoteKey } from "@/lib/designVotes";

export const DESIGN_VOTES_TAG = "design-votes";
export const DESIGN_EXAMPLES_TAG = "design-examples";

/** Public frame of a custom design; keyed by project id, never the private preview token. */
export const showcaseEmbedPath = (id: string) => `/website/examples/${id}/embed`;

/** Projects that have a design and a preview link, newest first. Never exposes the token or designUrl. */
export const loadShowcaseProjects = cachedQuery(DESIGN_EXAMPLES_TAG, 300, async () => {
  const rows = await db.websiteProject.findMany({
    where: { designUrl: { not: null }, previewToken: { not: null } },
    orderBy: { updatedAt: "desc" },
    take: 60,
    select: {
      id: true,
      businessName: true,
      category: true,
      city: true,
      status: true,
      domain: true,
      liveUrl: true,
      sources: true,
    },
  });
  return rows;
});

export type ShowcaseProject = Awaited<ReturnType<typeof loadShowcaseProjects>>[number];

export const loadDesignTallies = cachedQuery(DESIGN_VOTES_TAG, CONTENT_TTL, async () => {
  const groups = await db.designVote.groupBy({ by: ["projectId", "vote"], _count: { _all: true } });
  const out: Record<string, DesignTally> = {};
  for (const group of groups) {
    const tally = (out[group.projectId] ??= emptyTally());
    if (group.vote in tally) tally[group.vote as DesignVoteKey] = group._count._all;
  }
  return out;
});

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * A bare page with only the business name and the framed design — no price,
 * buttons or coupon box. No referrer leaves it, so the design host never sees
 * where it is framed, and search engines are told to skip it.
 */
export function designEmbedResponse(project: { businessName: string; designUrl: string } | null) {
  const headers = {
    "Content-Type": "text/html; charset=utf-8",
    "Referrer-Policy": "no-referrer",
    "X-Robots-Tag": "noindex, nofollow",
    "Cache-Control": "private, no-store",
  };
  if (!project) {
    return new NextResponse("<!doctype html><title>Not found</title><p>Not found</p>", { status: 404, headers });
  }
  const name = escapeHtml(project.businessName);
  return new NextResponse(
    `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="referrer" content="no-referrer">
<title>${name} — website design</title>
<style>
  html,body{margin:0;padding:0;height:100%;background:#fff;font-family:"Segoe UI",Helvetica,Arial,sans-serif}
  body{display:flex;flex-direction:column}
  .bar{padding:6px 12px;font-size:13px;font-weight:800;color:#0f172a;border-bottom:1px solid #e2e8f0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  iframe{flex:1;width:100%;border:0;display:block}
</style></head><body>
<div class="bar">${name}</div>
<iframe src="${escapeHtml(project.designUrl)}" title="${name} — website design" referrerpolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
</body></html>`,
    { headers },
  );
}
