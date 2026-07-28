import { db } from "@/lib/db";

export const MIN_YEAR = 1950;

/** Matching key for an institution: case, punctuation and spacing all ignored. */
export function institutionSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export type AlumniEntry = {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  city: string;
  endYear: string;
  current: boolean;
};

export const EMPTY_ENTRY: AlumniEntry = {
  institution: "",
  degree: "",
  fieldOfStudy: "",
  city: "",
  endYear: "",
  current: false,
};

export type AlumniMatch = {
  id: string;
  institution: string;
  degree: string | null;
  fieldOfStudy: string | null;
  city: string | null;
  endYear: number | null;
  current: boolean;
  user: {
    name: string;
    username: string | null;
    avatarUrl: string | null;
    headline: string | null;
    location: string | null;
  };
};

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
