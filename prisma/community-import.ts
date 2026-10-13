import { db } from "../src/lib/db";
import { slugify } from "../src/lib/slug";
import { subcategorySlug } from "../src/lib/categories";
import { titleCase } from "../src/lib/titlecase";

/**
 * Seeds the community & nonprofit directory from the IRS Exempt Organizations
 * Business Master File — the public register of every tax-exempt body in the
 * United States, published as plain CSV and in the public domain.
 *
 *   npm run db:community              # 900 desi associations across the US
 *   npm run db:community -- 1500      # or another cap
 *
 * Only the register's own facts are used: legal name, street, town, state and
 * the EIN that keys the row. No description, no photo, no phone — the card is
 * unclaimed and free, credited to the IRS listing, so the association can
 * claim it and fill in the rest. Re-runnable: rows are keyed by their IRS
 * lookup page and a claimed or edited card is never overwritten.
 */

const FILES = ["eo1", "eo2", "eo3", "eo4"];
const SOURCE = "irs-eo-bmf";

/**
 * Words that make an organisation a desi one. A row has to match on its own
 * name, so the directory stays a desi directory rather than a copy of the
 * whole register.
 */
const DESI =
  /\b(INDIA|INDIAN|INDO|INDIA'?S|TELUGU|TELANGANA|ANDHRA|TAMIL|TAMILNADU|GUJARATI|GUJARAT|PUNJABI|PUNJAB|BENGALI|BENGAL|MARATHI|MAHARASHTRA|KANNADA|KARNATAKA|MALAYALEE|MALAYALI|MALAYALAM|KERALA|ODIA|ORISSA|ODISHA|ASSAMESE|ASSAM|BIHAR|RAJASTHAN|SINDHI|KASHMIRI|KONKANI|TULU|NEPALI|NEPALESE|NEPAL|BANGLADESHI|BANGLADESH|PAKISTANI|PAKISTAN|SRI LANKAN|SRI LANKA|SINHALA|BHUTAN|DESI|HINDU|SIKH|JAINS?|SOUTH ASIAN|ASIAN INDIAN|BHARATIYA|BHARAT|SANATAN|SAMAJ|SANGAM|SANGHAM|MANDAL|SEVA|SEWA)\b/;

/**
 * "Indian" in an American name is very often a river, a school district or a
 * Native American body, none of which belong in a desi directory.
 */
const NOT_DESI =
  /\b(AMERICAN INDIAN|INDIANS? TRIBE|TRIBAL|TRIBE OF|RESERVATION|INDIAN NATION|NATIVE AMERICAN|FIRST NATIONS|POWWOW|POW WOW|CHEROKEE|SIOUX|NAVAJO|CHOCTAW|CHICKASAW|APACHE|SEMINOLE|IROQUOIS|MOHAWK|LAKOTA|OJIBWE|OJIBWA|PUEBLO|SHAWNEE|POTAWATOMI|CHIPPEWA|WEST INDIAN|INDIANA|INDIANAPOLIS|INDIAN (TRAIL|HILLS?|RIVER|CREEK|LAKE|VALLEY|ORCHARD|SPRINGS?|HARBOR|HARBOUR|MOUND|ROCKS?|HEAD|LAND|WELLS|PRAIRIE|MEADOWS?|POINT|SHORES|BEACH|OAKS|WOODS|MILLS|BROOK|RIDGE|CROSSING|SUMMIT|ACRES|GROVE|BAY|ISLAND|PATH|FIELD)|INDIAN (SCHOOL|HIGH SCHOOL) DISTRICT)\b/;

/** Rows that belong in the temples directory or another category, not here. */
const NOT_COMMUNITY =
  /\b(TEMPLE|MANDIR|CHURCH|CHAPEL|MOSQUE|MASJID|GURDWARA|GURUDWARA|SYNAGOGUE|MINISTRIES|MINISTRY|CONGREGATION|PARISH|DIOCESE|SEMINARY|MISSION(S)? (CHURCH|SOCIETY)|CHARTER SCHOOL|ACADEMY OF|PTA|PTO|BOOSTER|SCHOLARSHIP FUND OF)\b/;

/**
 * Which shelf of the community category a name belongs on. The first match
 * wins, so the narrower groups come before the broad ones.
 */
const SHELVES: [string, RegExp][] = [
  [
    "Business Chambers",
    /CHAMBER OF COMMERCE|CHAMBERS OF COMMERCE|BUSINESS (ASSOCIATION|COUNCIL|FORUM|NETWORK|GROUP)|ENTREPRENEUR|MERCHANTS|TRADE (COUNCIL|ASSOCIATION)|PROFESSIONALS? (ASSOCIATION|NETWORK|SOCIETY)|PHYSICIANS|DOCTORS|ENGINEERS|PHARMACISTS|HOTEL (OWNERS|ASSOCIATION)|MOTEL/,
  ],
  [
    "Student Associations",
    /STUDENT|CAMPUS|UNIVERSITY|COLLEGE|ALUMNI|ALUMNAE|IIT |IIM |NIT |BITS |ANNA UNIVERSITY|OSMANIA|JNTU/,
  ],
  ["Senior Citizen Groups", /SENIOR|ELDER|RETIRE|GOLDEN AGE|VRIDDH/],
  [
    "Sports Clubs & Leagues",
    /CRICKET|SPORTS|SPORTING|ATHLETIC|KABADDI|KABBADI|BADMINTON|SOCCER|FOOTBALL|VOLLEYBALL|TENNIS|CHESS|CARROM|KHO KHO|MARATHON|YOUTH LEAGUE|SPORTS? LEAGUE/,
  ],
  [
    "Cultural & Arts Groups",
    /CULTURAL|CULTURE|FINE ARTS|ARTS|DANCE|MUSIC|NATYA|NRITYA|KALA|SANGEET|SANGEETHA|THEATER|THEATRE|HERITAGE|LITERARY|FILM|POETRY|SAHITYA|FOLK|FESTIVAL/,
  ],
  [
    "Volunteer Groups",
    /VOLUNTEER|SEWA|SEVA|HELPING HAND|OUTREACH|COMMUNITY SERVICE|FOOD BANK|BLOOD/,
  ],
  [
    "Charities & NGOs",
    /FOUNDATION|CHARIT|RELIEF|TRUST|WELFARE|AID |HUMANITARIAN|EDUCATIONAL FUND|MEDICAL RELIEF|DEVELOPMENT (FUND|SOCIETY)|EMPOWER/,
  ],
  [
    "Regional & Language Groups",
    /TELUGU|TAMIL|GUJARATI|PUNJABI|BENGALI|MARATHI|KANNADA|MALAYAL|ODIA|SINDHI|KASHMIRI|KONKANI|ASSAM|BIHAR|RAJASTHAN|SAMAJ|SANGAM|SANGHAM|MANDAL|NEPALI|SINHALA|URDU|HINDI|MARWARI|AGRAWAL|AGARWAL|PATIDAR|BRAHMIN|REDDY|NADAR|NAIR/,
  ],
];

/** Anything else desi with an organisation word in its name. */
const ASSOCIATION =
  /ASSOCIATION|SOCIETY|COMMUNITY|ORGANIZATION|ORGANISATION|CENTER|CENTRE|FEDERATION|COUNCIL|CLUB|FORUM|NETWORK|SABHA|PARISHAD|UNION|ALLIANCE|FRIENDS OF|OF AMERICA|OF USA|USA INC/;

function shelfOf(name: string) {
  if (NOT_COMMUNITY.test(name) || NOT_DESI.test(name)) return null;
  for (const [shelf, words] of SHELVES) {
    if (words.test(name)) return shelf;
  }
  return ASSOCIATION.test(name) ? "Indian Associations" : null;
}

/** Splits one CSV line, honouring the quoting the register uses for names. */
function splitCsv(line: string) {
  const cells: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (quoted) {
      if (char === '"') {
        if (line[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else quoted = false;
      } else cell += char;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === ",") {
      cells.push(cell);
      cell = "";
    } else cell += char;
  }

  cells.push(cell);
  return cells;
}

type Row = {
  ein: string;
  name: string;
  street: string;
  city: string;
  state: string;
  shelf: string;
};

async function readRegister(file: string) {
  const response = await fetch(`https://www.irs.gov/pub/irs-soi/${file}.csv`);
  if (!response.ok) throw new Error(`IRS HTTP ${response.status} for ${file}`);
  const body = await response.text();
  const lines = body.split(/\r?\n/);
  const header = splitCsv(lines[0]);
  const at = (field: string) => header.indexOf(field);
  const [ein, name, street, city, state, status] = [
    at("EIN"),
    at("NAME"),
    at("STREET"),
    at("CITY"),
    at("STATE"),
    at("STATUS"),
  ];

  const rows: Row[] = [];
  for (let index = 1; index < lines.length; index += 1) {
    if (!lines[index]) continue;
    const cells = splitCsv(lines[index]);
    // 01 is "unconditionally exempt"; revoked and pending rows are skipped.
    if (cells[status] !== "01") continue;

    const legalName = (cells[name] ?? "").trim();
    if (!legalName || legalName.length > 110) continue;
    if (!DESI.test(legalName.toUpperCase())) continue;

    const shelf = shelfOf(legalName.toUpperCase());
    if (!shelf) continue;

    rows.push({
      ein: (cells[ein] ?? "").trim(),
      name: legalName,
      street: (cells[street] ?? "").trim(),
      city: (cells[city] ?? "").trim(),
      state: (cells[state] ?? "").trim(),
      shelf,
    });
  }

  return rows;
}

/** "INDIA ASSOCIATION OF NEW ENGLAND INC" reads badly in a heading. */
function displayName(legalName: string) {
  return titleCase(
    legalName
      .replace(/\s+/g, " ")
      // The register keeps a care-of contact in the name field; that is the
      // treasurer's own name, not the organisation's.
      .replace(/\s+C\/?O\s+.*$/i, "")
      .replace(/[,.]?\s+(INC|INCORPORATED|LLC|CORP|CORPORATION)\.?$/i, "")
      .trim(),
  );
}

async function main() {
  const limit = Number(process.argv[2] ?? 900);
  const rows: Row[] = [];

  for (const file of FILES) {
    // eslint-disable-next-line no-await-in-loop
    const found = await readRegister(file);
    console.log(`${file}: ${found.length} desi organisations`);
    rows.push(...found);
  }

  // A name the filter no longer accepts — an American-Indian body or a road
  // called Indian Creek — is dropped again on the next run, as long as nobody
  // has claimed the card in the meantime.
  const keep = new Set(
    rows.map((row) => `https://apps.irs.gov/app/eos/details/?ein=${row.ein}`),
  );
  const stale = await db.business.findMany({
    where: { source: SOURCE, ownerId: null },
    select: { id: true, sourceUrl: true },
  });
  const drop = stale
    .filter((row) => !row.sourceUrl || !keep.has(row.sourceUrl))
    .map((row) => row.id);
  if (drop.length) {
    await db.business.deleteMany({ where: { id: { in: drop } } });
    console.log(`dropped ${drop.length} rows the filter no longer accepts`);
  }

  // Spread the cap over the shelves so one of them cannot fill the category,
  // and over states so the page is not all New Jersey.
  const shelves = Array.from(new Set(rows.map((row) => row.shelf)));
  const perShelf = Math.max(1, Math.ceil(limit / shelves.length));
  const takenByShelf = new Map<string, number>();
  const takenByState = new Map<string, number>();
  const perState = Math.max(6, Math.ceil(limit / 12));

  let created = 0;
  let refreshed = 0;
  let skipped = 0;

  for (const row of rows) {
    if (created + refreshed >= limit) break;
    const shelfTaken = takenByShelf.get(row.shelf) ?? 0;
    if (shelfTaken >= perShelf) continue;
    const stateTaken = takenByState.get(row.state) ?? 0;
    if (stateTaken >= perState) continue;

    const name = displayName(row.name);
    const city = titleCase(row.city);
    if (!name || !city || !row.state || !row.ein) continue;

    // The register's own public lookup page for this EIN: what we credit.
    const sourceUrl = `https://apps.irs.gov/app/eos/details/?ein=${row.ein}`;
    // eslint-disable-next-line no-await-in-loop
    const existing = await db.business.findUnique({
      where: { sourceUrl },
      select: { id: true, ownerId: true, source: true },
    });

    if (existing) {
      // Never touch a card somebody has claimed, or one added by hand.
      if (existing.ownerId || existing.source !== SOURCE) {
        skipped += 1;
        continue;
      }
      // eslint-disable-next-line no-await-in-loop
      await db.business.update({
        where: { id: existing.id },
        data: {
          name,
          city,
          state: row.state,
          address: row.street ? titleCase(row.street) : null,
        },
      });
      refreshed += 1;
      takenByShelf.set(row.shelf, shelfTaken + 1);
      takenByState.set(row.state, stateTaken + 1);
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const duplicate = await db.business.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        city: { equals: city, mode: "insensitive" },
      },
      select: { id: true },
    });
    if (duplicate) {
      skipped += 1;
      continue;
    }

    const base = slugify(`${name} ${city}`) || `community-${row.ein}`;
    // eslint-disable-next-line no-await-in-loop
    const clash = await db.business.findUnique({
      where: { slug: base },
      select: { id: true },
    });

    // eslint-disable-next-line no-await-in-loop
    await db.business.create({
      data: {
        slug: clash ? `${base}-${row.ein.slice(-4)}` : base,
        name,
        profileType: "BUSINESS",
        categorySlug: "community-orgs",
        subcategorySlug: subcategorySlug("community-orgs", row.shelf),
        category: row.shelf,
        city,
        state: row.state,
        country: "USA",
        address: row.street ? titleCase(row.street) : null,
        status: "APPROVED",
        source: SOURCE,
        sourceUrl,
      },
    });

    created += 1;
    takenByShelf.set(row.shelf, shelfTaken + 1);
    takenByState.set(row.state, stateTaken + 1);
  }

  const total = await db.business.count({
    where: { categorySlug: "community-orgs", status: "APPROVED" },
  });
  console.log(
    `Community & nonprofit: +${created} new, ${refreshed} refreshed, ${skipped} already known — ${total} on the category page`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
