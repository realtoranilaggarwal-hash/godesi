import { db } from "@/lib/db";

/**
 * Marks a booking paid and opens its run window. Idempotent: the status guard
 * means the webhook and the success redirect can both call this safely.
 */
export async function confirmAdOrder({
  adOrderId,
  provider,
  reference,
  amount,
  currency,
}: {
  adOrderId: string;
  provider: string;
  reference: string;
  amount: number;
  currency: string;
}) {
  const order = await db.adOrder.findUnique({ where: { id: adOrderId } });
  if (!order) return null;
  if (order.status === "PAID") return order;

  const claimed = await db.adOrder.updateMany({
    where: { id: order.id, status: "PENDING" },
    data: { status: "PAID", provider, reference, amount, currency },
  });
  if (claimed.count === 0) return db.adOrder.findUnique({ where: { id: order.id } });

  if (order.bannerId) {
    const startsAt = new Date();
    const endsAt = new Date(startsAt);
    endsAt.setMonth(endsAt.getMonth() + order.months);

    await db.banner.update({
      where: { id: order.bannerId },
      data: { status: "PENDING", startsAt, endsAt },
    });
  }

  return db.adOrder.findUnique({ where: { id: order.id } });
}
