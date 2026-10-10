/**
 * The State Department's monthly Visa Bulletin, India column next to the rest
 * of the world. travel.state.gov sits behind a bot wall that blocks server
 * fetches, so the month is typed in by hand when each bulletin comes out
 * (usually mid-month for the next month). Dates are as printed: "C" is
 * current, "U" unavailable.
 */
export type BulletinRow = {
  category: string;
  label: string;
  india: string;
  rest: string;
};

export type Bulletin = {
  month: string;
  sourceUrl: string;
  /** Which employment chart USCIS accepts I-485s on; null until USCIS announces it. */
  uscisEmploymentChart: "FINAL_ACTION" | "DATES_FOR_FILING" | null;
  employment: { finalAction: BulletinRow[]; filing: BulletinRow[] };
  family: { finalAction: BulletinRow[]; filing: BulletinRow[] };
};

const EB_LABELS: Record<string, string> = {
  "EB-1": "Priority workers (EB-1)",
  "EB-2": "Advanced degree / exceptional ability (EB-2)",
  "EB-3": "Skilled workers & professionals (EB-3)",
  "EB-3 Other": "Other workers (EB-3)",
};

const FB_LABELS: Record<string, string> = {
  F1: "Unmarried sons & daughters of US citizens (F1)",
  F2A: "Spouses & children of green card holders (F2A)",
  F2B: "Unmarried adult sons & daughters of green card holders (F2B)",
  F3: "Married sons & daughters of US citizens (F3)",
  F4: "Brothers & sisters of adult US citizens (F4)",
};

function rows(
  labels: Record<string, string>,
  values: Record<string, [india: string, rest: string]>,
): BulletinRow[] {
  return Object.entries(values).map(([category, [india, rest]]) => ({
    category,
    label: labels[category] ?? category,
    india,
    rest,
  }));
}

export const CURRENT_BULLETIN: Bulletin = {
  month: "October 2026",
  sourceUrl:
    "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2027/visa-bulletin-for-october-2026.html",
  uscisEmploymentChart: null,
  employment: {
    finalAction: rows(EB_LABELS, {
      "EB-1": ["01FEB23", "C"],
      "EB-2": ["01NOV13", "01JAN25"],
      "EB-3": ["01JAN14", "15MAY24"],
      "EB-3 Other": ["01JAN14", "01JAN22"],
    }),
    filing: rows(EB_LABELS, {
      "EB-1": ["01JUL24", "C"],
      "EB-2": ["15JAN15", "15MAR26"],
      "EB-3": ["15JAN15", "01AUG24"],
      "EB-3 Other": ["15JAN15", "01JUN22"],
    }),
  },
  family: {
    finalAction: rows(FB_LABELS, {
      F1: ["22JAN20", "22JAN20"],
      F2A: ["22SEP26", "22SEP26"],
      F2B: ["22AUG19", "22AUG19"],
      F3: ["22OCT14", "22OCT14"],
      F4: ["15DEC06", "22OCT11"],
    }),
    filing: rows(FB_LABELS, {
      F1: ["01FEB20", "01FEB20"],
      F2A: ["C", "C"],
      F2B: ["01SEP19", "01SEP19"],
      F3: ["01NOV14", "01NOV14"],
      F4: ["01FEB07", "01NOV11"],
    }),
  },
};

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

/** "01NOV13" → 2013-11-01 (UTC); "C"/"U" → null. */
export function parseBulletinDate(value: string): Date | null {
  const match = /^(\d{2})([A-Z]{3})(\d{2})$/.exec(value);
  if (!match) return null;
  const month = MONTHS.indexOf(match[2]);
  if (month < 0) return null;
  return new Date(Date.UTC(2000 + Number(match[3]), month, Number(match[1])));
}

export function formatBulletinDate(value: string) {
  if (value === "C") return "Current";
  if (value === "U") return "Unavailable";
  const date = parseBulletinDate(value);
  if (!date) return value;
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
