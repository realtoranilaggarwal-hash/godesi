import type { GiftClaim } from "@prisma/client";

/** How a scratch winner collects a vendor gift; safe to import in client components. */
export const GIFT_CLAIM_LABELS: Record<GiftClaim, string> = {
  VISIT_STORE: "Visit the store and show your code",
  VISIT_WEBSITE: "Visit their website and quote your code",
  POST_REVIEW: "Post a review of the business on GoDesi",
};
