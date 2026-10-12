export const MAX_ACTIVE_DEALS = 5;

/** Expiry is the last valid day, so the offer runs to the end of it. */
export function endOfDay(date: string) {
  return new Date(`${date}T23:59:59.999Z`);
}

export function expiryLabel(expiresAt: Date | null) {
  if (!expiresAt) return null;
  return `Ends ${expiresAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })}`;
}
