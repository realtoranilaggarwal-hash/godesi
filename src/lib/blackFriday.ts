/**
 * Black Friday → Cyber Monday 2026 strip under the header. Everything keys off
 * BLACK_FRIDAY, so changing the dates or deleting this file (and its imports) removes it.
 */
export const BLACK_FRIDAY = {
  /** New York time, inclusive start and exclusive end. */
  startsAt: "2026-11-27T00:00:00-05:00",
  endsAt: "2026-12-01T00:00:00-05:00",
  nyeUrl:
    "https://www.newyearevesparty.com/events/grand-new-years-eve-party-2027?utm_source=godesi&utm_campaign=black-friday-2026",
};

export function blackFridayLive(now = new Date()) {
  return now >= new Date(BLACK_FRIDAY.startsAt) && now < new Date(BLACK_FRIDAY.endsAt);
}
