/** Wheel slices in clockwise order from the top. Weights are out of 100. */
export const SPIN_SLICES = [
  {
    key: "p2",
    label: "2 points",
    short: "2",
    points: 2,
    weight: 32,
    color: "#fde68a",
  },
  {
    key: "deal",
    label: "A business deal",
    short: "🏷️",
    points: 0,
    weight: 20,
    color: "#fecdd3",
  },
  {
    key: "p5",
    label: "5 points",
    short: "5",
    points: 5,
    weight: 25,
    color: "#bfdbfe",
  },
  {
    key: "p25",
    label: "25 points",
    short: "25",
    points: 25,
    weight: 6,
    color: "#ddd6fe",
  },
  {
    key: "p10",
    label: "10 points",
    short: "10",
    points: 10,
    weight: 15,
    color: "#bbf7d0",
  },
  {
    key: "p50",
    label: "50 points",
    short: "50",
    points: 50,
    weight: 2,
    color: "#fed7aa",
  },
] as const;

export type SpinSliceKey = (typeof SPIN_SLICES)[number]["key"];

/** Shown when the deal slice comes up but no business has an offer running. */
export const NO_DEAL_FALLBACK: SpinSliceKey = "p2";

export const SPIN_TIME_ZONE = "America/New_York";

/** The GoDesi day a spin counts against: YYYY-MM-DD in New York time. */
export function spinDay(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SPIN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function sliceIndex(key: string) {
  return Math.max(
    0,
    SPIN_SLICES.findIndex((slice) => slice.key === key),
  );
}

/** Picks a slice by weight from a uniform roll in [0, total). */
export function sliceForRoll(roll: number) {
  let left = roll;
  for (const slice of SPIN_SLICES) {
    if (left < slice.weight) return slice;
    left -= slice.weight;
  }
  return SPIN_SLICES[0];
}

export const SPIN_TOTAL_WEIGHT = SPIN_SLICES.reduce(
  (sum, s) => sum + s.weight,
  0,
);
