import { entities, page, pause, type Lead, type Reader } from "./shared";

/**
 * deshvidesh.com — the print magazine's advertiser index: 1,500-odd Florida
 * businesses that already pay for advertising, which is what makes them worth
 * ringing. The index gives only a name, a trade and a link to the business's
 * own site, so the importer reads the contact facts from that site instead.
 *
 *   npm run db:prospects -- deshvidesh
 *   npm run db:prospects -- deshvidesh disc-jockey astrologer
 */

const ROOT = new URL("https://www.deshvidesh.com/our-advertisers/");
const PAGE_LIMIT = 40;
/** A full page of advertisers; fewer means the pager has run out. */
const PER_PAGE = 14;

/** Only the listing area, so the site's own menus aren't read as advertisers. */
function listing(html: string) {
  const start = html.indexOf('class="entry"');
  return start < 0 ? html : html.slice(start);
}

const base = `${ROOT.origin}${ROOT.pathname.replace(/\/$/, "")}`;

async function trades() {
  const html = await page(ROOT.toString());
  if (!html) return [];
  const found = new Set<string>();
  for (const match of Array.from(
    html.matchAll(new RegExp(`href="${base}/([a-z0-9-]+)/"`, "g")),
  )) {
    found.add(match[1]);
  }
  return Array.from(found).sort();
}

/**
 * The advertiser's own site. Their entry links out to it, and that link is the
 * only thing we take from the page — the rest of it is the magazine's work.
 */
async function ownSite(sourceUrl: string) {
  const html = await page(sourceUrl);
  await pause();
  if (!html) return "";

  const links = Array.from(
    listing(html).matchAll(/href="(https?:\/\/[^"]+)"/g),
  ).map((match) => match[1]);
  const outward = links.find((link) => {
    try {
      const host = new URL(link).hostname.replace(/^www\./, "");
      return (
        !host.endsWith("deshvidesh.com") &&
        !/(facebook|twitter|x\.com|instagram|linkedin|youtube|pinterest|google|whatsapp|t\.me|wordpress|gravatar)\./.test(
          host,
        )
      );
    } catch {
      return false;
    }
  });
  return outward ?? "";
}

async function* advertisers(trade: string): AsyncGenerator<Lead> {
  for (let index = 1; index <= PAGE_LIMIT; index += 1) {
    const html = await page(
      index === 1 ? `${base}/${trade}/` : `${base}/${trade}/page/${index}/`,
    );
    await pause();
    if (!html) return;

    const rows = Array.from(
      listing(html).matchAll(
        /class="post_title"><a href="([^"]+)"[^>]*>([^<]*)<\/a>/g,
      ),
    );
    for (const row of rows) {
      const name = entities(row[2]);
      if (!name) continue;
      yield {
        name,
        trade: trade.replace(/-/g, " "),
        sourceUrl: row[1],
        websiteUrl: await ownSite(row[1]),
      };
    }
    if (rows.length < PER_PAGE) return;
  }
}

export const deshvidesh: Reader = {
  host: "deshvidesh.com",
  filter: "trade, e.g. disc-jockey astrologer",
  async *read(only) {
    const wanted = only.length ? only : await trades();
    console.log(`deshvidesh.com: ${wanted.length} trades`);
    for (const trade of wanted) {
      let count = 0;
      for await (const lead of advertisers(trade)) {
        count += 1;
        yield lead;
      }
      console.log(`  ${trade}: ${count}`);
    }
  },
};
