import { feedHeadlines, googleNewsFeed } from "@/lib/visaNews";

const CRYPTO_NEWS_FEED = googleNewsFeed(
  "(bitcoin OR ethereum OR crypto OR cryptocurrency) when:2d",
);

export const CRYPTO_NEWS_REVALIDATE = 60 * 60;

export function cryptoHeadlines(limit = 10) {
  return feedHeadlines(CRYPTO_NEWS_FEED, limit, CRYPTO_NEWS_REVALIDATE);
}
