import type { Role } from "@prisma/client";
import { isStaff } from "@/lib/auth";
import { db } from "@/lib/db";

/** Organisers run the club; the creator is always one. GoDesi staff can step in on any club. */
export async function isClubOrganizer(
  clubId: string,
  user: { id: string; role: Role },
) {
  if (isStaff(user)) return true;
  const member = await db.clubMember.findUnique({
    where: { clubId_userId: { clubId, userId: user.id } },
    select: { role: true, status: true },
  });
  return member?.role === "ORGANIZER" && member.status === "ACTIVE";
}
