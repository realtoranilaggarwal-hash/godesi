import { NextResponse } from "next/server";
import { loadProject } from "@/lib/websiteProjects";
import { renderSite } from "@/lib/websiteRender";

export const dynamic = "force-dynamic";

/** The preview itself: a whole standalone page, shown in the iframe on /preview. */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const project = await loadProject(params.id);
  if (!project || !project.content) {
    return new NextResponse("Not found", { status: 404 });
  }
  return new NextResponse(renderSite(project), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
