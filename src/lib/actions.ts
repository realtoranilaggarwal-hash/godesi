export type ActionState = { error?: string; success?: string };

export const emptyState: ActionState = {};

export function fieldError(error: unknown): ActionState {
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") return { error: "Please sign in first." };
    if (error.message === "FORBIDDEN") return { error: "You do not have access to this." };
    return { error: error.message };
  }
  return { error: "Something went wrong. Please try again." };
}
