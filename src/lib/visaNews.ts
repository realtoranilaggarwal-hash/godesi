import { db } from "@/lib/db";
import { parseFeed } from "@/lib/news";

/** A Google News search feed across publishers. */
export function googleNewsFeed(query: string) {
  return (
    "https://news.google.com/rss/search?q=" +
    encodeURIComponent(query) +
    "&hl=en-US&gl=US&ceid=US:en"
  );
}

/** Google News search across publishers, limited to the last week. */
const VISA_NEWS_FEED = googleNewsFeed(
  '(H-1B OR "green card" OR USCIS OR "visa bulletin" OR "F-1 visa" OR OPT OR "US visa" OR "Canada visa") when:7d',
);

export const VISA_NEWS_REVALIDATE = 3 * 60 * 60;

export type VisaHeadline = {
  title: string;
  source: string | null;
  link: string;
  publishedAt: Date;
};

/** Google News titles end in " - Publisher"; split it off so it can be credited. */
export function splitPublisher(title: string) {
  const match = title.match(/^(.*\S)\s+[-–—]\s+(\S.{1,59})$/);
  return match
    ? { title: match[1], source: match[2].trim() }
    : { title, source: null };
}

/** Newest headlines from a feed, publisher split off and duplicates dropped. */
export async function feedHeadlines(
  feedUrl: string,
  limit: number,
  revalidate: number,
): Promise<VisaHeadline[]> {
  try {
    const response = await fetch(feedUrl, {
      headers: { "User-Agent": "GodesiNewsBot/1.0" },
      next: { revalidate },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return [];
    const seen = new Set<string>();
    return parseFeed(await response.text())
      .map((item) => ({
        ...splitPublisher(item.title),
        link: item.link,
        publishedAt: item.publishedAt,
      }))
      .filter((item) => {
        const key = item.title.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, limit);
  } catch {
    return [];
  }
}

export function visaHeadlines(limit = 10) {
  return feedHeadlines(VISA_NEWS_FEED, limit, VISA_NEWS_REVALIDATE);
}

/** Directory subcategories whose businesses help with visas and immigration. */
export const IMMIGRATION_HELP_SUBCATEGORIES = [
  "professionals-immigration-consultants",
  "professionals-attorneys",
  "it-training-h1b-and-visa-support",
  "travel-visa-and-passport",
  "business-services-lawyers-and-legal",
];

export async function immigrationHelpers(limit = 8) {
  return db.business.findMany({
    where: {
      status: "APPROVED",
      OR: [
        { subcategorySlug: { in: IMMIGRATION_HELP_SUBCATEGORIES } },
        { extraCategorySlugs: { hasSome: IMMIGRATION_HELP_SUBCATEGORIES } },
      ],
    },
    orderBy: [
      { featured: "desc" },
      { featuredRank: "desc" },
      { updatedAt: "desc" },
    ],
    take: limit,
    select: {
      slug: true,
      name: true,
      category: true,
      city: true,
      logoUrl: true,
      featured: true,
      subcategoryRef: { select: { name: true } },
    },
  });
}
