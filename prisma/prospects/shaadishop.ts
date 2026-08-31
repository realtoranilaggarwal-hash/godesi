import {
  entities,
  page,
  pause,
  stateCode,
  type Lead,
  type Reader,
} from "./shared";

/**
 * blog.shaadishop.co — state-by-state lists of US Indian wedding vendors, one
 * page per region ("Indian Wedding Vendors New York and New Jersey"), each
 * naming several hundred businesses under a trade heading with the town and a
 * link to the business's own website.
 *
 *   npm run db:prospects -- shaadishop
 *   npm run db:prospects -- shaadishop texas
 *
 * The list gives us who exists, what they do and where; the phone comes from
 * the business's own site, which the importer reads next. ShaadiShop's own
 * words and pictures are theirs and are not touched.
 */

const ROOT = "https://blog.shaadishop.co";

/** Regions outside the US, which we skip. */
const NOT_US = /toronto|vancouver|canada|british-columbia/;

/** Their own pages and the platforms a vendor links instead of a website. */
const NOT_A_VENDOR_SITE =
  /(shaadishop|wordpress|gmpg\.org|w3\.org|google\.com|paypal|eventbrite)\./;

/**
 * The trade, from the heading above the list: "Indian Wedding Photographers in
 * New York and New Jersey" is simply "Photographers".
 */
function trade(heading: string) {
  return (
    entities(heading)
      .replace(/[{}]/g, " ")
      .replace(/^\s*indian wedding\s*/i, "")
      .replace(/\s+in\s+.*$/i, "")
      .replace(/\s*\(.*\)\s*$/, "")
      .replace(/\s*(companies|artists)$/i, "")
      .trim() || "wedding"
  );
}

/**
 * The town the list prints in brackets after a name, e.g. "(Parsippany, NJ)".
 * A bracket with no state — "(NY, NY)" or "(serving the tri-state area)" — is
 * read for whatever it does say and left blank otherwise.
 */
function place(bracket: string) {
  const parts = entities(bracket)
    .split(",")
    .map((part) => part.replace(/\s*\(.*/, "").trim())
    .filter(Boolean);

  for (let index = parts.length - 1; index >= 0; index -= 1) {
    const state = stateCode(parts[index]);
    if (!state) continue;
    return { city: town(index > 0 ? parts[index - 1] : ""), state };
  }
  return { city: "", state: "" };
}

/**
 * A town, or nothing. The brackets often carry what the vendor does rather than
 * where it is — "(Dhol Player; NY)", "(Band/Music, NY)" — and a trade is not an
 * address, so anything that isn't plainly a place name is dropped.
 */
function town(value: string) {
  const name = value.split(/[;/]/).pop()?.trim() ?? "";
  if (!/^[A-Za-z][A-Za-z.' -]{2,}$/.test(name)) return "";
  if (stateCode(name)) return "";
  if (/^(nyc|new york city)$/i.test(name)) return "New York";
  return name;
}

function strip(html: string) {
  return entities(html.replace(/<[^>]+>/g, " "));
}

/** The regional list pages, from the sitemap they publish for crawlers. */
async function lists() {
  const xml = await page(`${ROOT}/page-sitemap.xml`);
  if (!xml) return [];
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g))
    .map((match) => match[1])
    .filter((url) => /indian-wedding-.*vendor/.test(url) && !NOT_US.test(url));
}

/** Every business named under a trade heading on one regional list. */
function* vendors(html: string, url: string): Generator<Lead> {
  const sections = html.split(/<h2[^>]*>/).slice(1);
  const seen = new Set<string>();

  for (const section of sections) {
    const [head, ...rest] = section.split("</h2>");
    const heading = strip(head);
    // Only the trade lists are wrapped in their pink braces; "{About This
    // List}" and the planning guides are prose, not vendors.
    if (!heading.startsWith("{") || /about this list|guides/i.test(heading)) {
      continue;
    }
    const body = rest.join("</h2>");

    for (const entry of Array.from(
      body.matchAll(
        /<a[^>]+href="(https?:\/\/[^"]+)"[^>]*>([\s\S]*?)<\/a>([^<]*(?:<\/?span[^>]*>[^<]*)*)/g,
      ),
    )) {
      const website = entry[1];
      const name = strip(entry[2]);
      if (!name || name.length < 2) continue;
      try {
        if (NOT_A_VENDOR_SITE.test(new URL(website).hostname)) continue;
      } catch {
        continue;
      }
      // One business can appear under two trades on the same page.
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      const where = place(strip(entry[3]).match(/\(([^)]*)\)/)?.[1] ?? "");
      const slug = key.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

      yield {
        name,
        trade: trade(heading),
        // The page is one URL, so each business is anchored within it.
        sourceUrl: `${url}#${slug}`,
        city: where.city,
        state: where.state,
        websiteUrl: /facebook|instagram/.test(website) ? "" : website,
      };
    }
  }
}

export const shaadishop: Reader = {
  host: "blog.shaadishop.co",
  filter: "region in the page slug, e.g. texas",
  async *read(only) {
    const urls = (await lists()).filter(
      (url) => !only.length || only.some((word) => url.includes(word)),
    );
    console.log(`blog.shaadishop.co: ${urls.length} regional vendor lists`);

    for (const url of urls) {
      const html = await page(url);
      await pause();
      if (!html) continue;
      yield* vendors(html, url);
    }
  },
};
