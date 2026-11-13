import { db } from "@/lib/db";
import { designEmbedResponse } from "@/lib/designShowcase";

export const dynamic = "force-dynamic";

/**
 * The "new" side of a card on /website/examples. Keyed by project id so the
 * private preview token (which can approve the site) never appears in public.
 */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const project = await db.websiteProject.findUnique({
    where: { id: params.id },
    select: { businessName: true, designUrl: true, previewToken: true },
  });
  if (!project?.designUrl || !project.previewToken) return designEmbedResponse(null);
  return designEmbedResponse({ businessName: project.businessName, designUrl: project.designUrl });
}
