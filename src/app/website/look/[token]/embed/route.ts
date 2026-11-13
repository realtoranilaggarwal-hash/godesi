import { db } from "@/lib/db";
import { designEmbedResponse } from "@/lib/designShowcase";

export const dynamic = "force-dynamic";

/** The private preview with only the design and name — for framing or sending on. */
export async function GET(_request: Request, { params }: { params: { token: string } }) {
  const project = await db.websiteProject.findUnique({
    where: { previewToken: params.token },
    select: { businessName: true, designUrl: true, status: true },
  });
  if (!project?.designUrl || project.status === "CANCELLED") return designEmbedResponse(null);
  return designEmbedResponse({ businessName: project.businessName, designUrl: project.designUrl });
}
