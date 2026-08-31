/**
 * WedBae — a nationwide US wedding vendor index.
 *
 * Its city pages are plain HTML and print the facts a moderator needs: who
 * they are, the street, the town and a number to ring. There are tens of
 * thousands of those pages, so a run is always narrowed by trade and state,
 * e.g. `caterers nj`, and the crawl stays one page at a time.
 */

import {
  entities,
  page,
  pause,
  phone,
  stateCode,
  type Lead,
  type Reader,
} from "./shared";

const HOST = "www.wedbae.com";
const ROOT = `https://${HOST}`;

/** The city pages, e.g. /wedding-vendors/caterers/nj/edison/. */
const CITY_PAGE = /\/wedding-vendors\/[a-z0-9-]+\/[a-z]{2}\/[a-z0-9-]+\/$/;

async function cityPages(only: string[]) {
  const found: string[] = [];
  for (let number = 1; number <= 8; number += 1) {
    const xml = await page(`${ROOT}/sitemap${number}.xml`);
    await pause();
    if (!xml) break;
    for (const match of Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g))) {
      const url = match[1];
      if (!CITY_PAGE.test(url)) continue;
      const parts = url.split("/").filter(Boolean);
      // ["https:", "www.wedbae.com", "wedding-vendors", trade, state, city]
      const words = parts.slice(-3);
      if (only.length && !only.every((word) => words.includes(word))) continue;
      found.push(url);
    }
  }
  return found;
}

/**
 * One entry per listed business: the link to its own page (which makes the row
 * unique), the name, the street, and the town, state and number as printed.
 */
const ENTRY =
  /<strong>\s*\d+\.\s*<a href="(\/wedding-vendors\/[a-z]{2}\/[a-z0-9-]+\/[a-z0-9-]+\/)"[^>]*>([^<]+)<\/a><\/strong>\s*<br\s*\/?>([\s\S]*?)<\/p>/g;

function trade(url: string) {
  const said = url.split("/").filter(Boolean).at(-3) ?? "";
  return (
    said
      .split("-")
      .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
      .join(" ") || "Wedding Vendor"
  );
}

export const wedbae: Reader = {
  host: "wedbae.com",
  filter: "trade and state, e.g. caterers nj",
  async *read(only) {
    if (!only.length) {
      console.log(
        "wedbae.com: narrow the run, e.g. `caterers nj` — the whole index is 44,000 city pages",
      );
      return;
    }

    const urls = await cityPages(only);
    console.log(`wedbae.com: ${urls.length} city pages for ${only.join(" ")}`);

    for (const url of urls) {
      const html = await page(url);
      await pause();
      if (!html) continue;

      for (const found of Array.from(html.matchAll(ENTRY))) {
        const name = entities(found[2]);
        if (!name) continue;

        const lines = found[3]
          .split(/<br\s*\/?>/)
          .map((line) => entities(line.replace(/<[^>]+>/g, " ")))
          .filter(Boolean);
        const town = lines.find((line) => /,\s*[A-Za-z]{2}$/.test(line)) ?? "";
        const [city, state] = town.split(",").map((part) => part.trim());
        const number = lines.find((line) => phone(line));

        const lead: Lead = {
          name,
          trade: trade(url),
          sourceUrl: `${ROOT}${found[1]}`,
          phone: number ? phone(number) : "",
          city: city && !/,/.test(city) ? city : "",
          state: stateCode(state ?? ""),
          address: lines.find(
            (line) => /^\d+\s+\S/.test(line) && line !== town,
          ),
        };
        yield lead;
      }
    }
  },
};
