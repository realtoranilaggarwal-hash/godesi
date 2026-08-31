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
 * indianweddings.org — a US South Asian wedding vendor directory. Every vendor
 * page publishes machine-readable facts for search engines: name, telephone,
 * enquiry email, town, state and the vendor's own website. We read those.
 *
 *   npm run db:prospects -- indianweddings
 *   npm run db:prospects -- indianweddings dallas
 *
 * Their own photos and their own write-ups stay theirs; nothing is copied.
 */

const ROOT = "https://indianweddings.org";

/** Vendor pages, from the sitemap they publish for crawlers. */
async function profiles() {
  const xml = await page(`${ROOT}/sitemap.xml`);
  if (!xml) return [];
  return Array.from(xml.matchAll(/<loc>([^<]*\/vendors\/[^<]+)<\/loc>/g))
    .map((match) => match[1])
    .filter((url) => !url.endsWith("/vendors"));
}

export const indianweddings: Reader = {
  host: "indianweddings.org",
  filter: "slug fragment, e.g. dallas or venue",
  async *read(only) {
    const urls = (await profiles()).filter(
      (url) => !only.length || only.some((word) => url.includes(word)),
    );
    console.log(`indianweddings.org: ${urls.length} vendor pages`);

    for (const url of urls) {
      const html = await page(url);
      await pause();
      if (!html) continue;

      const found = localBusiness(html);
      if (!found) continue;
      const name = text(found.name);
      if (!name) continue;

      const where = postal(found.address);
      // Their page title ends with the trade, e.g. "… | Indian Wedding Venues".
      const trade = entities(
        html
          .match(/<title>([^<]*)<\/title>/)?.[1]
          ?.split("|")
          .slice(1)
          .join(" ")
          .replace(/indian wedding/i, "")
          .trim() || "wedding",
      );
      const websiteUrl = ownSite(found.sameAs, "indianweddings.org");

      const lead: Lead = {
        name,
        trade,
        sourceUrl: url,
        phone: phone(text(found.telephone)),
        email: ownEmail(text(found.email), "indianweddings.org"),
        city: text(where.addressLocality).replace(/\s+metro$/i, ""),
        state: stateCode(text(where.addressRegion)),
        address: text(where.streetAddress),
        websiteUrl,
      };
      yield lead;
    }
  },
};
