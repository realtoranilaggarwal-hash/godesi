import type { Plan, PointsReason } from "@prisma/client";

export type EarnReason = Exclude<PointsReason, "REDEMPTION" | "ADJUSTMENT">;

/** Published reward table — admins can override any value in `RewardSetting`. */
export const POINTS: Record<EarnReason, number> = {
  REFERRAL_SIGNUP: 5,
  PROFILE_CREATED: 20,
  PAID_UPGRADE: 100,
  LISTING_POSTED: 2,
  REVIEW_POSTED: 1,
  /// One point per US dollar, so the value comes from the payment itself.
  PAYMENT_SPEND: 0,
  REFERRAL_PROFILE: 20,
  REFERRAL_UPGRADE: 100,
  REFERRAL_LISTING: 15,
  NEWS_PUBLISHED: 10,
  NEWS_UPVOTED: 5,
  NEWS_FEATURED: 25,
  JOURNALIST_LEVEL: 50,
  FOUNDING_MEMBER: 50,
  /// Paid as a copy of whatever the member just earned, so it has no fixed value.
  FOUNDING_BONUS: 0,
};

export const REASON_LABELS: Record<PointsReason, string> = {
  REFERRAL_SIGNUP: "A friend signed up with your link",
  PROFILE_CREATED: "You completed your business profile",
  PAID_UPGRADE: "You upgraded to a paid plan",
  LISTING_POSTED: "You posted a listing or event",
  REFERRAL_PROFILE: "Your referral completed their profile",
  REFERRAL_UPGRADE: "Your referral upgraded to a paid plan",
  REFERRAL_LISTING: "Your referral posted a listing or event",
  NEWS_PUBLISHED: "Your news story was approved",
  NEWS_UPVOTED: "Your news story is popular with members",
  NEWS_FEATURED: "Your story was picked as important news",
  JOURNALIST_LEVEL: "You reached a new local journalist level",
  FOUNDING_MEMBER: "Welcome, founding member 🏅",
  FOUNDING_BONUS: "Founding member bonus — double points 🏅",
  REVIEW_POSTED: "You reviewed a business",
  PAYMENT_SPEND: "Points for money spent with Godesi",
  REDEMPTION: "Points redeemed",
  ADJUSTMENT: "Adjusted by the Godesi team",
};

export const REWARDS = [
  {
    key: "banner",
    label: "300 × 250 sidebar banner for a month",
    points: 500,
    auto: false,
  },
  {
    key: "featured-listing",
    label: "Featured listing for 30 days",
    points: 300,
    auto: true,
  },
  {
    key: "promote-event",
    label: "Promote an event on the homepage",
    points: 250,
    auto: false,
  },
  {
    key: "pro-month",
    label: "One month of Pro membership",
    points: 400,
    auto: true,
  },
] as const;

/** Points it costs to unlock one requirement's contact details. */
export const UNLOCK_LEAD_POINTS = 60;

/**
 * One point per US dollar spent. Amounts arrive in the payment currency's minor
 * unit, so they are converted through the live rate table first.
 */

/**
 * Debits points for something bought with them. Returns null when the member
 * cannot afford it, or when this exact purchase was already paid for.
 */

/**
 * How much a member has given the community, as a 0–100 bar. 1000 lifetime
 * points is a full bar, which keeps early contributors visibly moving.
 */

export function contributionBar(earned: number) {
  return Math.max(2, Math.min(100, Math.round((earned / 1000) * 100)));
}

export type Contributor = {
  id: string;
  name: string;
  username: string | null;
  location: string | null;
  avatarUrl: string | null;
  plan: Plan;
  points: number;
};

export function rewardFor(key: string) {
  return REWARDS.find((reward) => reward.key === key) ?? null;
}

/**
 * Credits points, notifies the member, and pays the inviter their referral
 * bonus. `once` makes the award idempotent per user and reason, which is what
 * stops a repeated profile save from farming points.
 */

export type Wallet = { earned: number; used: number; balance: number };
