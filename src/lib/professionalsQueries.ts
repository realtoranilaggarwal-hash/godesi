import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

/**
 * A profile earns its place in the free professionals directory by being
 * finished: a handle to link to, a line saying what they do, and something
 * substantial behind it. Nobody is approved by hand, so the list grows itself.
 */
const COMPLETE_PROFILE = {
  emailVerifiedAt: { not: null },
  bannedAt: null,
  username: { not: null },
  headline: { not: null },
  OR: [
    { bio: { not: null } },
    { experience: { not: null } },
    { skills: { isEmpty: false } },
  ],
} satisfies Prisma.UserWhereInput;

const CARD_FIELDS = {
  id: true,
  name: true,
  username: true,
  avatarUrl: true,
  headline: true,
  location: true,
  skills: true,
  openToWork: true,
  lookingFor: true,
  foundingNumber: true,
  plan: true,
} as const;

export type ProfessionalCardData = Prisma.UserGetPayload<{
  select: typeof CARD_FIELDS;
}>;

export type ProfessionalFilters = {
  q?: string;
  city?: string;
  open?: string;
};

function where(filters: ProfessionalFilters): Prisma.UserWhereInput {
  const and: Prisma.UserWhereInput[] = [COMPLETE_PROFILE];

  const q = filters.q?.trim();
  if (q) {
    and.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { headline: { contains: q, mode: "insensitive" } },
        { bio: { contains: q, mode: "insensitive" } },
        { experience: { contains: q, mode: "insensitive" } },
        { skills: { has: q } },
      ],
    });
  }

  const city = filters.city?.trim();
  if (city) and.push({ location: { contains: city, mode: "insensitive" } });
  if (filters.open === "1") and.push({ openToWork: true });

  return { AND: and };
}

/** A page of finished professional profiles, newest first. */
export async function professionalPage(
  filters: ProfessionalFilters,
  page: number,
  perPage: number,
) {
  const clause = where(filters);
  const [people, total] = await Promise.all([
    db.user.findMany({
      where: clause,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: CARD_FIELDS,
    }),
    db.user.count({ where: clause }),
  ]);

  return { people, total, pages: Math.max(1, Math.ceil(total / perPage)) };
}

export function professionalCount() {
  return db.user.count({ where: COMPLETE_PROFILE });
}

/** Newest finished profiles, for the strip on the Elite directory. */
export function newestProfessionals(take: number) {
  return db.user.findMany({
    where: COMPLETE_PROFILE,
    orderBy: { createdAt: "desc" },
    take,
    select: CARD_FIELDS,
  });
}
