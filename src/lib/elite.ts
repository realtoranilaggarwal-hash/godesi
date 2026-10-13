import type { Prisma, EliteBadge, EliteStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";

export const ELITE_STATUS_LABELS: Record<EliteStatus, string> = {
  PENDING: "Waiting for review",
  APPROVED: "Approved — our team will contact you",
  INTERVIEW_PENDING: "Interview being scheduled",
  INTERVIEW_COMPLETED: "Interview done — profile being prepared",
  PUBLISHED: "Published in GoDesi Elite",
  REJECTED: "Not accepted this time",
};

export const ELITE_BADGES: Record<
  EliteBadge,
  {
    label: string;
    ribbon: string;
    card: string;
    /** Ring around the portrait, and how large it is: paid tiers show a bigger face. */
    photo: string;
    photoSize: string;
  }
> = {
  FEATURED: {
    label: "⭐ Elite",
    ribbon: "bg-gradient-to-r from-amber-500 to-rose-500 text-white",
    card: "border-[3px] border-amber-400 bg-gradient-to-br from-amber-50 via-white to-white shadow-[0_0_0_1px_rgba(180,131,10,0.25),0_8px_20px_-8px_rgba(180,131,10,0.45)]",
    photo: "ring-2 ring-amber-400 ring-offset-2",
    photoSize: "h-20 w-20",
  },
  PREMIUM: {
    label: "💎 Premium",
    ribbon: "bg-gradient-to-r from-indigo-500 to-sky-500 text-white",
    card: "border-2 border-amber-300 bg-gradient-to-br from-amber-50/70 via-white to-white shadow-sm",
    photo: "ring-2 ring-amber-300 ring-offset-2",
    photoSize: "h-16 w-16",
  },
  BASIC: {
    label: "Member",
    ribbon: "bg-amber-100 text-amber-900",
    card: "border border-amber-200 bg-amber-50/20",
    photo: "ring-1 ring-amber-200 ring-offset-1",
    photoSize: "h-12 w-12",
  },
};

/** Interview formats an applicant can offer; "Skip interview" is allowed. */
export const INTERVIEW_TYPES = [
  "Phone interview",
  "WhatsApp interview",
  "Facebook Live",
  "Zoom interview",
  "Skip interview",
];

export const ELITE_CATEGORIES = [
  "Business & Entrepreneurship",
  "Real Estate",
  "Finance & Insurance",
  "Healthcare",
  "Technology",
  "Law & Immigration",
  "Education",
  "Arts, Media & Music",
  "Food & Hospitality",
  "Community & Non-profit",
  "Religion & Culture",
  "Sports & Fitness",
  "Public Service & Politics",
  "Other",
];

export type ElitePackageId =
  | "INTERVIEW"
  | "VIDEO_PRO"
  | "BOOST_100"
  | "BOOST_250"
  | "BOOST_500";

/**
 * Elite is paid-for recognition: the interview fee covers the shoot and a short
 * edit, the film is produced from material the member supplies, and a boost
 * simply lifts the profile higher inside its section.
 */
export const ELITE_PACKAGES: Record<
  ElitePackageId,
  { label: string; usd: number; blurb: string; kind: "INTERVIEW" | "VIDEO" | "BOOST" }
> = {
  INTERVIEW: {
    label: "Elite interview + 30–60 second video",
    usd: 50,
    blurb:
      "One-time. Our team interviews you by phone, WhatsApp, Zoom or Facebook Live and publishes your Elite profile with a 30–60 second video.",
    kind: "INTERVIEW",
  },
  VIDEO_PRO: {
    label: "3-minute professional film",
    usd: 500,
    blurb:
      "A professionally produced three-minute film built from the photos, footage and story you provide, embedded at the top of your profile.",
    kind: "VIDEO",
  },
  BOOST_100: {
    label: "Placement boost — $100",
    usd: 100,
    blurb: "Moves your profile above others in your section.",
    kind: "BOOST",
  },
  BOOST_250: {
    label: "Placement boost — $250",
    usd: 250,
    blurb: "Higher placement than the $100 boost.",
    kind: "BOOST",
  },
  BOOST_500: {
    label: "Placement boost — $500",
    usd: 500,
    blurb: "Top of your section, ahead of smaller boosts.",
    kind: "BOOST",
  },
};

export function elitePackageOrThrow(value: string) {
  const id = value as ElitePackageId;
  const item = ELITE_PACKAGES[id];
  if (!item) throw new Error("Unknown Elite package");
  return { id, ...item };
}

/** Spend first, then badge, then newest — so paying members sit on top. */
export const ELITE_ORDER: Prisma.EliteEntryOrderByWithRelationInput[] = [
  { paidCents: "desc" },
  { publishedAt: "desc" },
];

export type EliteFilters = {
  category?: string;
  city?: string;
  country?: string;
  badge?: string;
  q?: string;
};

/** Only published entries are ever public. */
export function eliteWhere(filters: EliteFilters): Prisma.EliteEntryWhereInput {
  const where: Prisma.EliteEntryWhereInput = { status: "PUBLISHED" };
  if (filters.category) where.category = filters.category;
  if (filters.city) where.city = { equals: filters.city, mode: "insensitive" };
  if (filters.country) where.country = { equals: filters.country, mode: "insensitive" };
  if (filters.badge === "FEATURED" || filters.badge === "PREMIUM") {
    where.badge = filters.badge;
  }
  if (filters.q) {
    where.OR = [
      { fullName: { contains: filters.q, mode: "insensitive" } },
      { businessName: { contains: filters.q, mode: "insensitive" } },
      { shortBio: { contains: filters.q, mode: "insensitive" } },
      { achievements: { contains: filters.q, mode: "insensitive" } },
    ];
  }
  return where;
}

export async function uniqueEliteSlug(name: string, city?: string) {
  const base = slugify(city ? `${name}-${city}` : name) || "member";
  let slug = base;
  let suffix = 1;
  while (await db.eliteEntry.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
  return slug;
}

/** Contact details are only shown for Premium and Featured entries. */
export function showsContact(badge: EliteBadge) {
  return badge !== "BASIC";
}
