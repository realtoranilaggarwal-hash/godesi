import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const PIXEL = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");

/** Partner reminder email open pixel: records the first and total opens. */
export async function GET(_request: Request, { params }: { params: { key: string } }) {
  await db.partnerFollowUp
    .updateMany({ where: { key: params.key, openedAt: null }, data: { openedAt: new Date() } })
    .then(() => db.partnerFollowUp.updateMany({ where: { key: params.key }, data: { opens: { increment: 1 } } }))
    .catch(() => null);
  return new Response(PIXEL, {
    headers: { "Content-Type": "image/gif", "Cache-Control": "no-store, max-age=0" },
  });
}
