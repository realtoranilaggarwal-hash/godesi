/** Events tagged with this only sell tickets to members with a Connect profile marked Single. */
export const SINGLES_ONLY_TAG = "singles-only";
/** Liquor is served at the singles party, so buyers must be 21+ (ID is checked at the door). */
export const SINGLES_MIN_AGE = 21;

export function isSinglesOnly(event: { tags: string[] }) {
  return event.tags.includes(SINGLES_ONLY_TAG);
}

/** Why this member can't buy a singles-only ticket yet, or null when they can. */
export function singlesBlocker(
  profile: {
    marital: string;
    status: string;
    adultConfirmedAt: Date | null;
    age: number | null;
  } | null,
) {
  if (!profile || profile.status === "REJECTED")
    return "This party is for singles only. Create your free GoDesi Connect profile first, marked Single.";
  if (profile.marital !== "SINGLE")
    return "This party is for singles only. Set your GoDesi Connect profile to Single to get a ticket.";
  if (!profile.adultConfirmedAt || (profile.age ?? 0) < SINGLES_MIN_AGE)
    return `This party is ${SINGLES_MIN_AGE}+ because liquor is served. Add your age (${SINGLES_MIN_AGE} or older) to your GoDesi Connect profile, and bring photo ID to the door.`;
  return null;
}

export function connectProfileHref(eventSlug: string) {
  return `/connect/new?next=${encodeURIComponent(`/events/${eventSlug}#tickets`)}`;
}

/** Only same-site paths, so `next` can't send people to another site. */
export function safeNextPath(value: unknown) {
  const path = typeof value === "string" ? value : "";
  // eslint-disable-next-line no-control-regex
  if (!path.startsWith("/") || /[\u0000-\u0020\\]/.test(path)) return null;
  const base = "https://same-site.invalid";
  try {
    const url = new URL(path, base);
    return url.origin === base ? `${url.pathname}${url.search}${url.hash}` : null;
  } catch {
    return null;
  }
}
