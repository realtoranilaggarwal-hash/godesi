import { db } from "@/lib/db";

/**
 * Confirmed, unbanned members. Those who picked a handle also have a profile
 * page; the rest are still faces of the community, just not links.
 */
const PUBLIC_MEMBER = {
  emailVerifiedAt: { not: null },
  bannedAt: null,
} as const;

/** Confirmed members who have a page to link to. */
const WITH_PAGE = { ...PUBLIC_MEMBER, username: { not: null } };

const CARD_FIELDS = {
  id: true,
  name: true,
  username: true,
  avatarUrl: true,
  location: true,
  headline: true,
  openToWork: true,
  foundingNumber: true,
  createdAt: true,
} as const;

export type MemberCard = {
  id: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  location: string | null;
  headline: string | null;
  openToWork: boolean;
  foundingNumber: number | null;
  createdAt: Date;
};

/** Newest members, for the home page shelf. */
export function newestMembers(
  take: number,
  { withPage = false }: { withPage?: boolean } = {},
): Promise<MemberCard[]> {
  return db.user.findMany({
    where: withPage ? WITH_PAGE : PUBLIC_MEMBER,
    orderBy: { createdAt: "desc" },
    take,
    select: CARD_FIELDS,
  });
}

export function publicMemberCount() {
  return db.user.count({ where: PUBLIC_MEMBER });
}

/** A page of members for /people, newest first. */
export async function memberPage(page: number, perPage: number) {
  const [members, total] = await Promise.all([
    db.user.findMany({
      where: WITH_PAGE,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: CARD_FIELDS,
    }),
    db.user.count({ where: WITH_PAGE }),
  ]);

  return { members, total, pages: Math.max(1, Math.ceil(total / perPage)) };
}
