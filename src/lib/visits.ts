import { db } from "@/lib/db";

export type VisitTotals = { views: number; visitors: number };

/** Midnight UTC today, the key of the day's row. */
function today() {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

/**
 * Adds one page view — and one visitor when the browser has not been counted
 * today — then returns the running totals shown in the footer.
 */
export async function countVisit(newVisitor: boolean): Promise<VisitTotals> {
  const day = today();
  await db.visitDay.upsert({
    where: { day },
    create: { day, views: 1, visitors: newVisitor ? 1 : 0 },
    update: {
      views: { increment: 1 },
      ...(newVisitor ? { visitors: { increment: 1 } } : {}),
    },
  });
  return visitTotals();
}

export async function visitTotals(): Promise<VisitTotals> {
  const totals = await db.visitDay.aggregate({
    _sum: { views: true, visitors: true },
  });
  return {
    views: totals._sum.views ?? 0,
    visitors: totals._sum.visitors ?? 0,
  };
}
