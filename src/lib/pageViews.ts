import { db } from "@/lib/db";

const SKIP = /^\/(api|admin|_next|dashboard|login|signup|checkout)(\/|$)/;

/** The counter key for a page: path only, lower-case, no trailing slash. Null when not counted. */
export function pageViewKey(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.length > 200) return null;
  const path = raw.split(/[?#]/)[0].replace(/\/+$/, "").toLowerCase() || "/";
  if (SKIP.test(path) || !/^[\w\-./%@~]*$/.test(path)) return null;
  return path;
}

export async function countPageView(path: string): Promise<number> {
  const row = await db.pageViewCount.upsert({
    where: { path },
    create: { path, views: 1 },
    update: { views: { increment: 1 } },
    select: { views: true },
  });
  return row.views;
}

export async function pageViews(path: string): Promise<number> {
  const row = await db.pageViewCount.findUnique({ where: { path }, select: { views: true } });
  return row?.views ?? 0;
}
