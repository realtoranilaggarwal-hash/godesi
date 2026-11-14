type Windowed = { salesStart: Date | string | null; salesEnd: Date | string | null };

const toDate = (value: Date | string | null) => (value ? new Date(value) : null);

/** A tier with no window is always on sale; otherwise only between its start and end. */
export function tierOnSale(tier: Windowed, now = new Date()) {
  const start = toDate(tier.salesStart);
  const end = toDate(tier.salesEnd);
  return (!start || start <= now) && (!end || end > now);
}


/** "Until Dec 15", "From Dec 16" or "Ended" — null when the tier has no window. */
export function tierWindowLabel(tier: Windowed, timeZone: string | null, now = new Date()) {
  const zone = timeZone || "America/New_York";
  const start = toDate(tier.salesStart);
  const end = toDate(tier.salesEnd);
  const day = (date: Date) =>
    new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: zone }).format(date);
  if (end && end <= now) return "Sale ended";
  if (start && start > now) return `On sale from ${day(start)}`;
  /** The window end is exclusive, so "until" names the last day it is on sale. */
  if (end) return `Until ${day(new Date(end.getTime() - 1))}`;
  return null;
}
