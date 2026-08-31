import { db } from "@/lib/db";
import { CONTENT_TTL, cachedQuery } from "@/lib/cache";

export type TeamMember = {
  id: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  headline: string | null;
  location: string | null;
  teamTitle: string | null;
  role: "ADMIN" | "MODERATOR";
};

/**
 * The people an admin has chosen to name publicly. Staff access alone is not
 * enough — a moderator only appears here once she is ticked on /admin/team, and
 * losing that access takes her off the page.
 */
export const publicTeam = cachedQuery(
  "public-team",
  CONTENT_TTL,
  async (): Promise<TeamMember[]> => {
    const rows = await db.user.findMany({
      where: {
        teamPublic: true,
        bannedAt: null,
        role: { in: ["ADMIN", "MODERATOR"] },
      },
      orderBy: [{ teamRank: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true,
        headline: true,
        location: true,
        teamTitle: true,
        role: true,
      },
    });
    return rows.map((row) => ({
      ...row,
      role: row.role === "ADMIN" ? "ADMIN" : "MODERATOR",
    }));
  },
);
