import { db } from "@/lib/db";

/**
 * Marks a booking paid and opens its run window. Idempotent: the status guard
 * means the webhook and the success redirect can both call this safely.
 */
export async function confirmAdOrder({
  adOrderId,
  provider,
  reference,
  amountMinor,
  currency,
}: {
  adOrderId: string;
  provider: string;
  reference: string;
  /** In the currency's minor unit (paise, cents). */
  amountMinor: number;
  currency: string;
}) {
  const order = await db.adOrder.findUnique({ where: { id: adOrderId } });
  if (!order) return null;
  if (order.status === "PAID") return order;

  const claimed = await db.adOrder.updateMany({
    where: { id: order.id, status: "PENDING" },
    data: { status: "PAID", provider, reference, amountMinor, currency },
  });
  if (claimed.count === 0) return db.adOrder.findUnique({ where: { id: order.id } });

  const bannerIds = order.bannerIds.length
    ? order.bannerIds
    : order.bannerId
      ? [order.bannerId]
      : [];

  if (bannerIds.length) {
    const startsAt = new Date();

    if (order.slot === "WALL") {
      /** Wall bricks are a one-time buy: they stay until the vendor pulls them. */
      await db.banner.updateMany({
        where: { id: { in: bannerIds } },
        data: { status: "PENDING", startsAt, endsAt: null },
      });
    } else if (order.pricing === "IMPRESSIONS" && order.impressions) {
      /** Impression packs run until the views are used up, not to a date. */
      const banner = await db.banner.findUniqueOrThrow({
        where: { id: bannerIds[0] },
        select: { impressions: true },
      });
      await db.banner.update({
        where: { id: bannerIds[0] },
        data: {
          status: "PENDING",
          startsAt,
          endsAt: null,
          impressionCap: banner.impressions + order.impressions,
        },
      });
    } else {
      const endsAt = new Date(startsAt);
      endsAt.setMonth(endsAt.getMonth() + order.months);

      await db.banner.updateMany({
        where: { id: { in: bannerIds } },
        data: { status: "PENDING", startsAt, endsAt },
      });
    }
  }

  return db.adOrder.findUnique({ where: { id: order.id } });
}
