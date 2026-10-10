const UNREACHABLE =
  /Can't reach database server|data transfer quota|connection pool|Connection terminated|ECONNREFUSED|ETIMEDOUT|server has closed the connection/i;
const UNREACHABLE_CODES = new Set([
  "P1001",
  "P1002",
  "P1008",
  "P1017",
  "P2024",
]);

/**
 * True when the database itself is unavailable — quota, pool or network — rather
 * than a query being wrong. Those recover on their own, so a page that only
 * decorates itself with data should render without it instead of crashing.
 */
export function isDatabaseUnreachable(error: unknown) {
  if (!(error instanceof Error)) return false;
  return (
    error.name === "PrismaClientInitializationError" ||
    ("code" in error &&
      typeof error.code === "string" &&
      UNREACHABLE_CODES.has(error.code)) ||
    UNREACHABLE.test(error.message)
  );
}

/**
 * Runs a read that the page can live without, falling back if the database is
 * unreachable. Real query errors still throw, so bugs stay visible.
 */
export async function optionalRead<T>(
  read: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await read();
  } catch (error) {
    if (isDatabaseUnreachable(error)) return fallback;
    throw error;
  }
}
