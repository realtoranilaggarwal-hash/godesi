/**
 * Indian-American newspapers + desi classifieds sites we list on /newspapers
 * and route through the /read top-bar reader. The host allowlist comes from
 * this table — /read refuses to frame anything not listed here, so it can't
 * be used as an open proxy.
 */
export type MediaPartner = { name: string; focus: string; url: string };

export const NEWSPAPERS: MediaPartner[] = [
  { name: "News India Times", focus: "National Indian-American news", url: "https://newsindiatimes.com" },
  { name: "Desi Talk", focus: "New York, New Jersey, Connecticut & Chicago", url: "https://www.desitalk.com" },
  { name: "The Indian American", focus: "Community stories & features", url: "https://newsindiatimes.com" },
  { name: "Gujarat Times", focus: "Gujarati-speaking community", url: "https://newsindiatimes.com" },
  { name: "India Tribune", focus: "Chicago-based Indian-American newspaper", url: "https://www.indiatribune.com" },
  { name: "India-West", focus: "West Coast Indian-American news", url: "https://www.indiawest.com" },
  { name: "India Journal", focus: "Southern California", url: "https://www.indiajournal.com" },
  { name: "The Indian Panorama", focus: "New York & Dallas; news and classifieds", url: "https://www.theindianpanorama.news" },
  { name: "India Currents", focus: "Journalism & community issues", url: "https://indiacurrents.com" },
  { name: "India New England", focus: "New England Indian-American community", url: "https://indianewengland.com" },
  { name: "Khabar", focus: "Atlanta & the Southeast", url: "https://www.khabar.com" },
  { name: "Desh-Videsh", focus: "Florida & the broader diaspora", url: "https://www.deshvidesh.com" },
  { name: "Khaas Baat", focus: "Florida Indian community", url: "https://www.khaasbaat.com" },
  { name: "The South Asian Times", focus: "New York metropolitan area", url: "https://thesouthasiantimes.info" },
  { name: "India Herald", focus: "Houston-area Indian community", url: "https://india-herald.com" },
  { name: "India Post", focus: "News & community coverage", url: "https://www.indiapost.com" },
  { name: "Indus Business Journal", focus: "Business & professional community", url: "https://www.indusbusinessjournal.com" },
  { name: "The Asian Era", focus: "Tri-state & Indian diaspora", url: "https://www.asianeraonline.com" },
  { name: "Panjab Express", focus: "Punjabi-language & English news", url: "https://www.panjabexpress.com" },
  { name: "India Bulletin", focus: "Chicago-area South Asian community", url: "https://www.indiabulletinusa.com" },
  { name: "India Life & Style", focus: "Indian-American lifestyle", url: "https://www.indianlifeandstyle.com" },
  { name: "Gujarati Samachar", focus: "Gujarati community in the USA", url: "https://www.gujaratsamachar.com" },
  { name: "Sandesh", focus: "Gujarati-language readership", url: "https://www.sandesh.com" },
  { name: "Telugu Naadi", focus: "Telugu-speaking diaspora", url: "https://www.telugunaadi.com" },
  { name: "India Abroad", focus: "Long-running diaspora newspaper", url: "https://www.indiaabroad.com" },
  { name: "Little India", focus: "Diaspora news, features & community", url: "https://www.littleindia.com" },
];

export const CLASSIFIEDS: MediaPartner[] = [
  { name: "Sulekha Classifieds", focus: "Rentals, roommates, jobs, services, used cars", url: "https://us.classifieds.sulekha.com" },
  { name: "Sulekha US", focus: "Local service providers & business leads", url: "https://us.sulekha.com" },
  { name: "ApnaUSA", focus: "Rooms, rentals, jobs, items & events", url: "https://apnausa.co" },
  { name: "eKnazar", focus: "City-based Indian community classifieds", url: "https://www.eknazar.com/ekClassifieds/" },
];

const ALLOWED_HOSTS = new Set(
  [...NEWSPAPERS, ...CLASSIFIEDS].map((p) => new URL(p.url).hostname.replace(/^www\./, "")),
);

/** Returns the URL only when it is http(s) on a listed partner's host. */
export function safePartnerUrl(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return ALLOWED_HOSTS.has(url.hostname.replace(/^www\./, ""))
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}
