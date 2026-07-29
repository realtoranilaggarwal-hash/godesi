import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

/** Godesi's cut of every ticket sold through a connected organiser account. */
export const PLATFORM_FEE_BPS = 200;

export function platformFeeMinor(amountMinor: number) {
  return Math.round((amountMinor * PLATFORM_FEE_BPS) / 10_000);
}

export function platformFeePercent() {
  return PLATFORM_FEE_BPS / 100;
}

/** The connected account ticket money should land in, or null to bill Godesi directly. */
export function payoutAccount(organizer: {
  stripeAccountId: string | null;
  stripePayoutsEnabled: boolean;
}) {
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
