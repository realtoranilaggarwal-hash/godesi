import { Prisma, PrismaClient } from "@prisma/client";

/**
 * Errors raised when the database is asleep or the pool is momentarily full,
 * rather than because the query itself is wrong.
 */
const RETRYABLE = new Set(["P1001", "P1002", "P1008", "P1017", "P2024"]);

function retryable(error: unknown): boolean {
  return (
    (error instanceof Prisma.PrismaClientKnownRequestError &&
      RETRYABLE.has(error.code)) ||
    error instanceof Prisma.PrismaClientInitializationError
  );
}

/**
 * The compute scales to zero when nobody is on the site, so the first query
 * after an idle spell can lose the race with Neon waking up. One retry turns
 * that into a slow page instead of a 500.
 */
function client() {
  return new PrismaClient().$extends({
    query: {
      async $allOperations({ args, query }) {
        try {
          return await query(args);
        } catch (error) {
          if (!retryable(error)) throw error;
          await new Promise((resolve) => setTimeout(resolve, 500));
          return query(args);
        }
      },
    },
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof client>;
};

export const db = globalForPrisma.prisma ?? client();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
