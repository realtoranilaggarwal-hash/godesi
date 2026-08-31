export type ActionState = { error?: string; success?: string };

export const emptyState: ActionState = {};

/**
 * Prisma errors carry table and column names, so they are never shown to the
 * member. Matched by name rather than by import, to keep the database client
 * out of the browser bundle.
 */
export function isDatabaseError(error: unknown) {
  return (
    error instanceof Error && error.name.startsWith("PrismaClient")
  );
}

/** True for a unique-index clash, e.g. two people claiming one name at once. */
export function uniqueViolation(error: unknown) {
  if (!isDatabaseError(error)) return false;
  const code = (error as Error & { code?: string }).code;
  return code === "P2002";
}

export function fieldError(error: unknown): ActionState {
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") return { error: "Please sign in first." };
    if (error.message === "FORBIDDEN") return { error: "You do not have access to this." };
    if (isDatabaseError(error)) {
      return { error: "Something went wrong saving that. Please try again." };
    }
    return { error: error.message };
  }
  return { error: "Something went wrong. Please try again." };
}
