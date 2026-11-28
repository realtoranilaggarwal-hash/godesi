/**
 * Thanksgiving weekend NYE ticket special: buyers until Saturday night get a free
 * featured GoDesi classified, a supporter spot on the NYE page and a 10% code in their name.
 */
export const NYE_SUPPORTER_SPECIAL = {
  /** New York time, inclusive start and exclusive end. */
  startsAt: "2026-11-27T00:00:00-05:00",
  endsAt: "2026-11-29T00:00:00-05:00",
  nyeUrl:
    "https://www.newyearevesparty.com/events/grand-new-years-eve-party-2027?utm_source=godesi&utm_campaign=thanksgiving-supporter-2026#thanksgiving-special",
};

export function nyeSupporterSpecialLive(now = new Date()) {
  return now >= new Date(NYE_SUPPORTER_SPECIAL.startsAt) && now < new Date(NYE_SUPPORTER_SPECIAL.endsAt);
}
