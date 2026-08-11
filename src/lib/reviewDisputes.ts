import { db } from "@/lib/db";
import type { Currency } from "@/lib/currency";

/**
 * Staff time is the cost here, so a takedown request carries a flat fee. It is
 * charged whatever the outcome — Godesi is not selling the removal itself.
 */
export const DISPUTE_FEE: Record<Currency, number> = { INR: 999, USD: 14 };

export function disputeFee(currency: Currency) {
  return DISPUTE_FEE[currency];
}

/**
 * Marks a takedown request paid so staff can look at it. Idempotent, so both the
 * webhook and the success redirect may call it.
 */
export async function confirmReviewDispute({
  disputeId,
  reference,
}: {
  disputeId: string;
  reference: string;
}) {
  const claimed = await db.reviewDispute.updateMany({
    where: { id: disputeId, status: "AWAITING_PAYMENT" },
    data: { status: "PENDING", paidAt: new Date(), paymentRef: reference },
  });
  if (claimed.count === 0) {
    return db.reviewDispute.findUnique({ where: { id: disputeId } });
  }
  return db.reviewDispute.findUnique({ where: { id: disputeId } });
}
