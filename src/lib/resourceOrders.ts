import { db } from "@/lib/db";

/**
 * Marks a link's views pack paid and tops up its quota. Idempotent, so the
 * webhook and the success redirect can both call it. The link still needs admin
 * approval before it appears in a box.
 */
export async function confirmResourceOrder({
  resourceOrderId,
  provider,
  reference,
  amountMinor,
  currency,
}: {
  resourceOrderId: string;
  provider: string;
  reference: string;
  amountMinor: number;
  currency: string;
}) {
  const order = await db.resourceOrder.findUnique({ where: { id: resourceOrderId } });
  if (!order) return null;
  if (order.status === "PAID") return order;

  const claimed = await db.resourceOrder.updateMany({
    where: { id: order.id, status: "PENDING" },
    data: { status: "PAID", provider, reference, amountMinor, currency },
  });
  if (claimed.count === 0) {
    return db.resourceOrder.findUnique({ where: { id: order.id } });
  }

  // Adding to the current count keeps any views already delivered intact when a
  // buyer tops up an existing link.
  await db.$executeRaw`
    UPDATE "ResourceLink"
    SET "impressionCap" = COALESCE("impressionCap", impressions) + ${order.impressions}
    WHERE id = ${order.linkId}
  `;

  return db.resourceOrder.findUnique({ where: { id: order.id } });
}
