import {
  localBusiness,
  ownEmail,
  ownSite,
  postal,
  text,
} from "./localBusiness";
import {
  entities,
  page,
  pause,
  phone,
  stateCode,
  type Lead,
  type Reader,
} from "./shared";

/**
 * theweddingconnect.com — a US wedding vendor directory. Not a desi site, but
 * every vendor page publishes the vendor's own telephone, mailbox, town, state
 * and website for search engines, which is a call list of American wedding
 * suppliers: DJs, halls, caterers, photographers, florists, planners.
 *
 *   npm run db:prospects -- weddingconnect
 *   npm run db:prospects -- weddingconnect dj
 *
 * Their write-ups, galleries and reviews are theirs; none of it is copied.
 */

const HOST = "theweddingconnect.com";
const ROOT = `https://${HOST}`;

/** Vendor pages, from the sitemap they publish for crawlers. */
async function profiles() {
  const xml = await page(`${ROOT}/sitemap.xml`);
  if (!xml) return [];
  return Array.from(xml.matchAll(/<loc>([^<]*\/vendors\/[^<]+)<\/loc>/g))
    .map((match) => match[1])
    .filter((url) => !url.endsWith("/vendors"));
}

/** Their page title ends with the trade and the state: "… | DJs - Florida". */
function trade(html: string) {
  const title = entities(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "");
  const tail = title.split("|").slice(1).join(" ");
  return tail.split("-")[0].trim() || "wedding";
}

export const weddingconnect: Reader = {
  host: HOST,
  filter: "slug fragment, e.g. dj or texas",
  async *read(only) {
    const urls = (await profiles()).filter(
      (url) => !only.length || only.some((word) => url.includes(word)),
    );
    console.log(`${HOST}: ${urls.length} vendor pages`);

    for (const url of urls) {
      const html = await page(url);
      await pause();
      if (!html) continue;

      const found = localBusiness(html);
      if (!found) continue;
      const name = text(found.name);
      if (!name) continue;

      const where = postal(found.address);
      const lead: Lead = {
        name,
        trade: trade(html),
        sourceUrl: url,
        phone: phone(text(found.telephone)),
        email: ownEmail(text(found.email), HOST),
        city: text(where.addressLocality),
        state: stateCode(text(where.addressRegion)),
        address: text(where.streetAddress),
        websiteUrl: ownSite(found.sameAs, HOST),
      };
      yield lead;
    }
  },
};
