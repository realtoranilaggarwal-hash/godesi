import { db } from "@/lib/db";
import { notify } from "@/lib/notifications";

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Marks carriage paid and pushes the paid-until date out by the months bought.
 * Idempotent, so the webhook and the success redirect can both call it. An admin
 * still has to approve the stream before it appears.
 */
export async function confirmLiveChannelOrder({
  liveChannelOrderId,
  provider,
  reference,
  amountMinor,
  currency,
}: {
  liveChannelOrderId: string;
  provider: string;
  reference: string;
  amountMinor: number;
  currency: string;
}) {
  const order = await db.liveChannelOrder.findUnique({
    where: { id: liveChannelOrderId },
  });
  if (!order) return null;
  if (order.status === "PAID") return order;

  const claimed = await db.liveChannelOrder.updateMany({
    where: { id: order.id, status: "PENDING" },
    data: { status: "PAID", provider, reference, amountMinor, currency },
  });
  if (claimed.count === 0) {
    return db.liveChannelOrder.findUnique({ where: { id: order.id } });
  }

  const channel = await db.liveChannel.findUnique({ where: { id: order.channelId } });
  if (channel) {
    await db.liveChannel.update({
      where: { id: channel.id },
      data: {
        paidUntil: new Date(
          Math.max(channel.paidUntil?.getTime() ?? 0, Date.now()) +
            order.months * MONTH_MS,
        ),
      },
    });
    await notify({
      userId: order.userId,
      title: `Carriage paid for ${channel.name}`,
      body: `${order.months} month${order.months > 1 ? "s" : ""} paid. It goes live as soon as our team approves the stream.`,
      href: "/live/submit",
    });
  }

  return db.liveChannelOrder.findUnique({ where: { id: order.id } });
}
