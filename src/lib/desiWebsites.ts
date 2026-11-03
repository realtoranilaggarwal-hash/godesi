import { CLASSIFIEDS, NEWSPAPERS } from "@/lib/mediaPartners";
import { db } from "@/lib/db";
import { cachedQuery } from "@/lib/cache";
import { optionalRead } from "@/lib/resilient";

export type Site = { name: string; focus: string; url: string };

export const GODESI: Site[] = [
  { name: "GoDesi business directory", focus: "Find desi-owned businesses near you", url: "/search" },
  { name: "GoDesi classifieds", focus: "Free ads: buy and sell, rooms, jobs, gigs", url: "/classifieds" },
  { name: "GoDesi weddings", focus: "Desi wedding vendors and free quotes", url: "/wedding" },
  { name: "GoDesi DJs", focus: "Indian DJs, dhol and sound", url: "/dj" },
  { name: "GoDesi events", focus: "Garba, Diwali, concerts and meetups", url: "/events" },
  { name: "GoDesi news", focus: "Desi community news", url: "/news" },
];

export const NETWORK: Site[] = [
  { name: "DJs.wiki", focus: "The desi DJs directory", url: "https://djs.wiki" },
  { name: "Eventringer", focus: "Every desi event near you: festivals, concerts, garba", url: "https://eventringer.com" },
  { name: "Diwali.cc", focus: "Find a Diwali, Navratri or Holi celebration", url: "https://diwali.cc" },
  { name: "Indian Business Association", focus: "Find, support and grow Indian-owned businesses", url: "https://indianbusinessassociation.com" },
  { name: "Desi Who's Who", focus: "Desi who's who in America", url: "https://desiwhoswho.com" },
  { name: "Desi Newspaper", focus: "Desi headlines, filed by the community", url: "https://desinewspaper.com" },
  { name: "IT Placement Help", focus: "IT jobs and placement help for desis in the USA", url: "https://itplacement.help" },
  { name: "IT Placement Services", focus: "Desi IT staffing and corporate training", url: "https://itplacementservices.com" },
  { name: "RealEstateYP", focus: "Find a real estate agent near you", url: "https://realestateyp.com" },
  { name: "GoDesi Cards", focus: "Every desi business, one short link", url: "https://godesi.us" },
];

export const DESI_WEBSITE_LISTS: { title: string; sites: Site[] }[] = [
  { title: "GoDesi.com", sites: GODESI },
  { title: "Desi directories, events and jobs", sites: NETWORK },
  { title: "Desi classifieds sites", sites: CLASSIFIEDS },
  { title: "Indian-American newspapers", sites: NEWSPAPERS },
];

/** Stable vote key: the path for GoDesi pages, the bare host for other sites. */
export function siteKey(url: string) {
  if (url.startsWith("/")) return `godesi.com${url}`;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export const VOTABLE_KEYS = new Set(
  DESI_WEBSITE_LISTS.flatMap((list) => list.sites.map((site) => siteKey(site.url))),
);

/** One grouped read every 5 minutes, however many people open the page. */
const voteCounts = cachedQuery("site-votes", 300, async () => {
  const rows = await db.siteVote.groupBy({ by: ["siteKey"], _count: { _all: true } });
  return Object.fromEntries(rows.map((row) => [row.siteKey, row._count._all]));
});

export function siteVoteCounts(): Promise<Record<string, number>> {
  return optionalRead(() => voteCounts(), {});
}
