import { db } from "@/lib/db";
import { effectivePlan } from "@/lib/plans";

/**
 * "Verified" is a claim about a business, so it has to be earned and it has to
 * expire: it is granted only while the card is approved and the owner is
 * present (claimed) or paying. Everything else that is live gets the honest
 * "Listed" wording instead, and a card we have pulled gets neither.
 */
export type BadgeLevel = "VERIFIED" | "LISTED" | "NONE";

export type BadgeStatus = {
  level: BadgeLevel;
  name: string;
  slug: string;
  category: string;
  city: string;
  /** Why the badge says what it says, in words the business can read. */
  reason: string;
  claimed: boolean;
  paid: boolean;
  /** Set when staff checked ID and licence documents. */
  staffChecked: boolean;
  listedSince: Date;
};

const NOT_LISTED: Omit<BadgeStatus, "slug"> = {
  level: "NONE",
  name: "",
  category: "",
  city: "",
  reason: "This business is not listed on Godesi right now.",
  claimed: false,
  paid: false,
  staffChecked: false,
  listedSince: new Date(0),
};

/** Slugs we generate; anything else cannot match a card and never reaches the database. */
const SLUG = /^[a-z0-9][a-z0-9-]{0,120}$/i;

export async function badgeStatus(slug: string): Promise<BadgeStatus> {
  if (!SLUG.test(slug)) {
    return { ...NOT_LISTED, slug };
  }

  const business = await db.business.findUnique({
    where: { slug },
    select: {
      slug: true,
      name: true,
      category: true,
      city: true,
      status: true,
      verifiedProvider: true,
      createdAt: true,
      owner: {
        select: { plan: true, planExpiresAt: true, bannedAt: true },
      },
    },
  });

  if (!business || business.status !== "APPROVED") {
    return { ...NOT_LISTED, slug };
  }

  const owner = business.owner;
  // A banned owner is not somebody we vouch for, so the card drops to Listed.
  const claimed = Boolean(owner && !owner.bannedAt);
  const paid = Boolean(owner && !owner.bannedAt && effectivePlan(owner) !== "FREE");
  const verified = claimed || paid;

  return {
    level: verified ? "VERIFIED" : "LISTED",
    name: business.name,
    slug: business.slug,
    category: business.category,
    city: business.city,
    claimed,
    paid,
    staffChecked: business.verifiedProvider,
    listedSince: business.createdAt,
    reason: verified
      ? business.verifiedProvider
        ? "Staff checked this provider's ID and licence documents."
        : paid
          ? "The owner holds a paid Godesi membership for this card."
          : "The owner signed in and claimed this card."
      : "This card is live on Godesi but nobody has claimed it yet.",
  };
}

export const BADGE_SIZES = {
  wide: { width: 200, height: 64 },
  small: { width: 120, height: 40 },
  square: { width: 160, height: 160 },
} as const;

export type BadgeSize = keyof typeof BADGE_SIZES;

export function badgeSize(value?: string | null): BadgeSize {
  return value === "small" || value === "square" ? value : "wide";
}

export function badgeTheme(value?: string | null) {
  return value === "dark" ? "dark" : "light";
}

export function badgeAlt(level: BadgeLevel, name?: string) {
  const label =
    level === "VERIFIED" ? "Verified on Godesi" : "Listed on Godesi";
  return name ? `${label} — ${name}` : label;
}
