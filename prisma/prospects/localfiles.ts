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
 * localfiles.com — desi yellow pages for 43 US metros, and the best call list
 * of the three: each entry prints the business name, a phone number and a full
 * street address, so a moderator can ring without any further digging.
 *
 *   npm run db:prospects -- localfiles
 *   npm run db:prospects -- localfiles new_jersey chicago
 */

const ROOT = "https://localfiles.com";

/** Every trade the yellow pages file businesses under, the same in each city. */
const TRADES = [
  "alteration_stiching_sewing",
  "art_craft",
  "associations",
  "astrology_vaastu",
  "auto_car_repair",
  "beauty_salon",
  "child_care_day_care",
  "cleaning_services",
  "clothing",
  "computer_services",
  "cricket",
  "dance",
  "doctors",
  "driving_instructor",
  "education",
  "entertainment_dj_desi",
  "event_organizer",
  "event_venues",
  "financial",
  "grocers",
  "handyman_home_repair",
  "health_yoga",
  "home_food",
  "insurance",
  "jewelery",
  "lawyers",
  "mehndi_henna",
  "misc_services",
  "movers_packers",
  "music",
  "photography",
  "priest_puja",
  "realtors",
  "religious_worship_place",
  "restaurants",
  "sweet_shop",
  "tax_services",
  "taxi_transportation",
  "travel_agents",
  "wedding",
];

/** A page holds thirty; beyond forty pages a trade is something else. */
const PER_PAGE = 30;
const PAGE_LIMIT = 40;

async function cities() {
  const html = await page(`${ROOT}/main/`);
  if (!html) return [];
  const found = new Set<string>();
  for (const match of Array.from(
    html.matchAll(/href="https:\/\/localfiles\.com\/indian\/([A-Za-z_]+)"/g),
  )) {
    found.add(match[1]);
  }
  return Array.from(found).sort();
}

/**
 * The street address, town, state and zip a listing prints — it hands them to
 * Google Maps in a link, which is the tidiest form of them on the page.
 */
function place(row: string) {
  const link = row.match(/maps\/search\/\?api=1&(?:amp;)?query=([^'"&]+)/);
  const shown = entities(
    row.match(/Get Directions">([\s\S]*?)<\/a>/)?.[1]?.replace(/<[^>]+>/g, "") ??
      "",
  );
  // Some rows show a "[map]" affordance rather than the town's name.
  const town = /^\[|\]$/.test(shown) ? "" : shown;
  if (!link) return { address: "", city: town, state: "" };

  const full = entities(decodeURIComponent(link[1].replace(/\+/g, " ")));
  // "400 Elmwood Avenue, Apt. 218 B,New York Mills, NY 14222"
  const tail = full.match(
    /^(.*?),\s*([^,]{2,60}),\s*([A-Za-z]{2}|[A-Za-z ]{4,20})\.?\s*(\d{4,5}(?:-\d{4})?)?$/,
  );
  if (!tail) return { address: full, city: town, state: "" };
  return {
    address: tail[1].replace(/[,\s]+$/, "").trim(),
    city: entities(tail[2]) || town,
    state: stateCode(tail[3]),
  };
}

/** The whole name, for an entry the index truncated. */
async function fullName(sourceUrl: string, listed: string) {
  const html = await page(sourceUrl);
  await pause();
  // The entry's own page carries the whole name in its title and nowhere else.
  const heading = entities(
    html?.match(/<title>([^<]*)<\/title>/)?.[1]?.split(/\s*[|–]\s*/)[0] ?? "",
  );
  return heading || listed.replace(/(\.\.\.|…)$/, "").trim();
}

/** One trade in one city, following the pager to the end. */
async function* listings(city: string, trade: string): AsyncGenerator<Lead> {
  for (let index = 1; index <= PAGE_LIMIT; index += 1) {
    const html = await page(
      `${ROOT}/indian/${city}/yellow_pages/${trade}/list_${index}.htm`,
    );
    await pause();
    if (!html) return;

    // Each result is one bordered row; the first chunk is everything above it.
    const rows = html.split('<div class="row border-bottom').slice(1);
    let yielded = 0;
    for (const row of rows) {
      const link = row.match(
        /href="(\/indian\/[^"]*\/yellow_pages\/[^"]*\.shtm)"[^>]*>\s*<strong>([\s\S]*?)<\/strong>/,
      );
      if (!link) continue;
      const listed = entities(link[2].replace(/<[^>]+>/g, ""));
      if (!listed) continue;
      const source = `${ROOT}${link[1]}`;
      // The index cuts long names off, so those few are read in full from the
      // entry's own page rather than saved half-written.
      const name = /(\.\.\.|…)$/.test(listed) ? await fullName(source, listed) : listed;

      const { address, city: town, state } = place(row);
      yielded += 1;
      yield {
        name,
        trade: trade.replace(/_/g, " "),
        sourceUrl: source,
        phone: phone(row.match(/fa-phone'><\/i><\/em>\s*([()\d\s.-]{10,20})/)?.[1] ?? ""),
        city: town,
        state,
        address,
      };
    }
    if (yielded < PER_PAGE) return;
  }
}

export const localfiles: Reader = {
  host: "localfiles.com",
  filter: "city, e.g. new_jersey chicago",
  async *read(only) {
    const towns = only.length ? only : await cities();
    console.log(`localfiles.com: ${towns.length} cities × ${TRADES.length} trades`);
    for (const city of towns) {
      let count = 0;
      for (const trade of TRADES) {
        for await (const lead of listings(city, trade)) {
          count += 1;
          yield lead;
        }
      }
      console.log(`  ${city}: ${count}`);
    }
  },
};
