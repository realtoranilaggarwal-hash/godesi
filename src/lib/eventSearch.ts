/** Date shortcuts offered above the event list. */
export const EVENT_WHEN = [
  { value: "", label: "Any date" },
  { value: "today", label: "Today" },
  { value: "weekend", label: "This weekend" },
  { value: "week", label: "Next 7 days" },
  { value: "month", label: "This month" },
  { value: "past", label: "Past events" },
] as const;

export type EventWhen = (typeof EVENT_WHEN)[number]["value"];

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

/** A yyyy-mm-dd box, only when it is a real date. */
function parseDay(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Turns the date controls into one `startsAt` filter. An explicit from/to
 * always wins over the shortcut, so a picked date is never widened.
 */
export function eventDateRange(
  when: string | undefined,
  from?: string,
  to?: string,
  now = new Date(),
) {
  const fromDay = parseDay(from);
  const toDay = parseDay(to);
  if (fromDay || toDay) {
    return {
      gte: fromDay ? startOfDay(fromDay) : now,
      ...(toDay ? { lte: endOfDay(toDay) } : {}),
    };
  }

  if (when === "past") return { lt: now };

  if (when === "today") return { gte: now, lte: endOfDay(now) };

  if (when === "weekend") {
    // Friday evening through Sunday night, and today onwards if it is already
    // the weekend.
    const day = now.getDay();
    const untilFriday = (5 - day + 7) % 7;
    const friday = startOfDay(new Date(now.getTime() + untilFriday * 86_400_000));
    const sunday = endOfDay(new Date(friday.getTime() + 2 * 86_400_000));
    return { gte: friday < now ? now : friday, lte: sunday };
  }

  if (when === "week") {
    return { gte: now, lte: endOfDay(new Date(now.getTime() + 7 * 86_400_000)) };
  }

  if (when === "month") {
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { gte: now, lte: endOfDay(end) };
  }

  return { gte: now };
}

/** Free text matched against the parts of an event people actually type. */
export function eventTextWhere(q?: string) {
  const term = q?.trim();
  if (!term) return undefined;
  const contains = { contains: term, mode: "insensitive" as const };
  // People type either half of a state, so "NJ" and "New Jersey" find the same
  // events whichever way the organiser wrote it.
  const stateTerms = statesMatching(term).map((state) => ({
    state: { equals: state, mode: "insensitive" as const },
  }));
  return {
    OR: [
      { title: contains },
      { venue: contains },
      { hallName: contains },
      { city: contains },
      { state: contains },
      { country: contains },
      { description: contains },
      { address: contains },
      ...stateTerms,
    ],
  };
}

/** Two-letter codes and full names of the states the diaspora is thickest in. */
export const US_STATES: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DC: "District of Columbia",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  IA: "Iowa",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  MA: "Massachusetts",
  MD: "Maryland",
  ME: "Maine",
  MI: "Michigan",
  MN: "Minnesota",
  MO: "Missouri",
  MS: "Mississippi",
  MT: "Montana",
  NC: "North Carolina",
  ND: "North Dakota",
  NE: "Nebraska",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NV: "Nevada",
  NY: "New York",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VA: "Virginia",
  VT: "Vermont",
  WA: "Washington",
  WI: "Wisconsin",
  WV: "West Virginia",
  WY: "Wyoming",
};

/** The label to show for a stored state, "NJ" → "New Jersey". */
export function stateLabel(state: string) {
  return US_STATES[state.trim().toUpperCase()] ?? state;
}

/** Both spellings of whatever the visitor typed, e.g. "texas" → ["TX", "Texas"]. */
export function statesMatching(term: string) {
  const wanted = term.trim().toLowerCase();
  const found: string[] = [];
  for (const [code, name] of Object.entries(US_STATES)) {
    if (code.toLowerCase() === wanted || name.toLowerCase() === wanted) {
      found.push(code, name);
    }
  }
  return found;
}
