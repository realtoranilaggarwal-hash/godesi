import { db } from "@/lib/db";
import { notify } from "@/lib/notifications";
import { awardSpendPoints } from "@/lib/rewardsQueries";
import { getStripe, stripeEnabled } from "@/lib/stripe";

const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

/**
 * Marks a Premium club payment paid and pushes `premiumUntil` out by the years
 * bought. Idempotent, so the webhook and the success redirect can both call it.
 */
export async function confirmClubOrder({
  clubOrderId,
  provider,
  reference,
  amountMinor,
  currency,
}: {
  clubOrderId: string;
  provider: string;
  reference: string;
  amountMinor: number;
  currency: string;
}) {
  const order = await db.clubOrder.findUnique({ where: { id: clubOrderId } });
  if (!order) return null;
  if (order.status === "PAID") return order;

  const claimed = await db.clubOrder.updateMany({
    where: { id: order.id, status: "PENDING" },
    data: { status: "PAID", provider, reference, amountMinor, currency },
  });
  if (claimed.count === 0) {
    return db.clubOrder.findUnique({ where: { id: order.id } });
  }

  const club = await db.club.findUnique({ where: { id: order.clubId } });
  if (club) {
    await db.club.update({
      where: { id: club.id },
      data: {
        premiumUntil: new Date(
          Math.max(club.premiumUntil?.getTime() ?? 0, Date.now()) +
            order.years * YEAR_MS,
        ),
      },
    });
    await notify({
      userId: order.userId,
      title: `${club.name} is a Premium club`,
      body: `No Godesi fee on your club's event tickets, Premium badge and top placement for ${order.years} year${order.years > 1 ? "s" : ""}.`,
      href: `/clubs/${club.slug}`,
    });
  }

  await awardSpendPoints({
    userId: order.userId,
    amountMinor,
    currency,
    note: "Premium club",
    reference,
  });

  return db.clubOrder.findUnique({ where: { id: order.id } });
}

/**
 * Success redirect: verifies the Checkout Session with Stripe before marking the
 * order paid, so a guessed id cannot upgrade a club. Idempotent with the webhook.
 */
export async function settleClubPremiumSession(
  sessionId: string,
  userId: string,
) {
  if (!stripeEnabled()) return false;
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const clubOrderId = session.metadata?.clubOrderId;
    if (
      session.metadata?.kind !== "club-premium" ||
      !clubOrderId ||
      session.metadata?.userId !== userId ||
      session.payment_status !== "paid"
    ) {
      return false;
    }
    const order = await confirmClubOrder({
      clubOrderId,
      provider: "stripe",
      reference: session.id,
      amountMinor: session.amount_total ?? 0,
      currency: (session.currency ?? "usd").toUpperCase(),
    });
    return order?.status === "PAID";
  } catch {
    return false;
  }
}
