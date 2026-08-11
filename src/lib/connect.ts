import type { User } from "@prisma/client";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { canReceiveDirectPayouts, effectivePlan } from "@/lib/plans";

/** Godesi's cut of a ticket sold by an organiser on the free plan. */
export const PLATFORM_FEE_BPS = 200;

export function platformFeePercent() {
  return PLATFORM_FEE_BPS / 100;
}

/** Paid members keep everything except the card processor's own charge. */
export function organiserPaysFee(organizer: Pick<User, "plan" | "planExpiresAt">) {
  return effectivePlan(organizer) === "FREE";
}

export function platformFeeMinor(
  amountMinor: number,
  organizer: Pick<User, "plan" | "planExpiresAt">,
) {
  if (!organiserPaysFee(organizer)) return 0;
  return Math.round((amountMinor * PLATFORM_FEE_BPS) / 10_000);
}

/**
 * The connected account ticket money should land in, or null when Godesi collects
 * and settles. Direct payout is a Premium benefit, so a lapsed plan falls back.
 */
export function payoutAccount(
  organizer: Pick<User, "plan" | "planExpiresAt"> & {
    stripeAccountId: string | null;
    stripePayoutsEnabled: boolean;
  },
) {
  if (!canReceiveDirectPayouts(organizer)) return null;
  return organizer.stripePayoutsEnabled ? organizer.stripeAccountId : null;
}

/**
 * Re-reads a connected account from Stripe and stores whether it can take money,
 * so the ticket flow never has to trust a stale flag.
 */
export async function syncConnectStatus(userId: string, accountId: string) {
  const account = await getStripe().accounts.retrieve(accountId);
  const enabled = Boolean(account.charges_enabled && account.payouts_enabled);
  await db.user.update({
    where: { id: userId },
    data: { stripeAccountId: accountId, stripePayoutsEnabled: enabled },
  });
  return enabled;
}
