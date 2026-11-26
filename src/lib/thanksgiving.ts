/**
 * Thanksgiving 2026 promotion: header turkey, specials banner, article and
 * tracked offer links. Everything keys off THANKSGIVING, so changing the dates
 * or deleting this file (and its imports) removes the promotion.
 */
export const THANKSGIVING = {
  campaign: "thanksgiving-2026",
  /** New York time, inclusive start and exclusive end. */
  startsAt: "2026-11-26T00:00:00-05:00",
  endsAt: "2026-11-27T00:00:00-05:00",
  /** NewsItem.guid of the article, set by scripts/post-thanksgiving-2026.ts. */
  articleGuid: "godesi:thanksgiving-2026",
  articleTitle:
    "Happy Thanksgiving 2026! Give Thanks, Share Opportunities & Celebrate Together",
  nyeCode: "TURKEY10",
  nyeUrl:
    "https://www.newyearevesparty.com/events/grand-new-years-eve-party-2027?coupon=TURKEY10&utm_source=godesi&utm_campaign=thanksgiving-2026",
  marketingUsd: 250,
  websiteUsd: 99,
};

export type ThanksgivingTarget = "article" | "nye" | "marketing" | "website";

export const THANKSGIVING_TARGETS: ThanksgivingTarget[] = ["article", "nye", "marketing", "website"];

export function thanksgivingLive(now = new Date()) {
  return (
    now >= new Date(THANKSGIVING.startsAt) && now < new Date(THANKSGIVING.endsAt)
  );
}

/** Tracked link: counts the click, then forwards to the offer. */
export function thanksgivingLink(target: ThanksgivingTarget, source: string) {
  return `/thanksgiving/go/${target}?from=${source}`;
}
