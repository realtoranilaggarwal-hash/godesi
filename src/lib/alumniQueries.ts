/**
 * The database half of alumni.ts — the labels and helpers next door are safe for client components, but a module that touches Prisma cannot be bundled for the browser.
 */

import { db } from "@/lib/db";
import { AlumniMatch, institutionSlug } from "@/lib/alumni";

/** Batchmate search: institution name (loose) plus an optional passing year. */
export async function findAlumni({
  institution,
  year,
  take = 60,
}: {
  institution?: string;
  year?: number;
  take?: number;
}): Promise<AlumniMatch[]> {
  const slug = institution ? institutionSlug(institution) : "";
  return db.alumniRecord.findMany({
    where: {
      ...(slug ? { slug: { contains: slug } } : {}),
      ...(year ? { endYear: year } : {}),
      user: { username: { not: null } },
    },
    orderBy: [{ endYear: "desc" }, { createdAt: "desc" }],
    take,
    select: {
      id: true,
      institution: true,
      degree: true,
      fieldOfStudy: true,
      city: true,
      endYear: true,
      current: true,
      user: {
        select: {
          name: true,
          username: true,
          avatarUrl: true,
          headline: true,
          location: true,
        },
      },
    },
  });
}

/** The biggest alumni groups on Godesi, for the "popular batches" shortcuts. */
export async function topInstitutions(limit = 12) {
  const rows = await db.alumniRecord.groupBy({
    by: ["institution"],
    _count: { institution: true },
    orderBy: { _count: { institution: "desc" } },
    take: limit,
  });
  return rows.map((row) => ({
    institution: row.institution,
    members: row._count.institution,
  }));
}

/** Alumni rows for a member's public profile, newest course first. */
export async function alumniFor(userId: string) {
  return db.alumniRecord.findMany({
    where: { userId },
    orderBy: [{ current: "desc" }, { endYear: "desc" }],
  });
}
