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
  { label: string; ribbon: string; card: string }
> = {
  FEATURED: {
    label: "⭐ Elite",
    ribbon: "bg-gradient-to-r from-amber-500 to-rose-500 text-white",
    card: "border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-white to-white shadow-md",
  },
  PREMIUM: {
    label: "💎 Premium",
    ribbon: "bg-gradient-to-r from-indigo-500 to-sky-500 text-white",
    card: "border-2 border-indigo-200 bg-indigo-50/40",
  },
  BASIC: {
    label: "Member",
    ribbon: "bg-slate-200 text-slate-700",
    card: "",
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
