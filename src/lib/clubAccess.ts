import { db } from "@/lib/db";

/** Organisers run the club; the creator is always one. */
export async function isClubOrganizer(clubId: string, userId: string) {
  const member = await db.clubMember.findUnique({
    where: { clubId_userId: { clubId, userId } },
    select: { role: true, status: true },
  });
  return member?.role === "ORGANIZER" && member.status === "ACTIVE";
}
