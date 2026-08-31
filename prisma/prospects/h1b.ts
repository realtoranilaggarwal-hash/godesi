import { createWriteStream } from "node:fs";
import { mkdir, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import ExcelJS from "exceljs";

import { phone, type Lead, type Reader } from "./shared";

/**
 * US IT companies, from the Labor Department's own H-1B disclosure file.
 *
 *   npm run db:prospects -- h1b                  # every US IT employer
 *   npm run db:prospects -- h1b nj ny            # two states
 *   npm run db:prospects -- h1b staffing tx      # one trade in one state
 *   npm run db:prospects -- h1b software         # one trade, nationwide
 *
 * Every employer that sponsors an H-1B has to file a Labor Condition
 * Application, and the department publishes the filings itself, quarter by
 * quarter, expressly for public disclosure. Each certified filing carries the
 * facts a moderator needs — company name, street, town, state and the
 * company's own switchboard number — and the number of workers on the filing
 * ranks the firms by size, which is why this beats any directory: it is
 * official, free, complete, and it is where the desi IT and staffing firms
 * are.
 *
 * The file is ~250 MB, so it is fetched once into the temp directory and read
 * as a stream. Point LCA_FILE at a copy to skip the download.
 */

/** The quarter to read. Newer quarters appear at the same path. */
const FILE = process.env.LCA_FILE_URL ?? "LCA_Disclosure_Data_FY2026_Q3.xlsx";
const SOURCE = "https://www.dol.gov/agencies/eta/foreign-labor/performance";

/**
 * What each line of business is called on a call sheet. Keyed by the North
 * American Industry Classification code the employer files under.
 */
const TRADES: [prefix: string, trade: string][] = [
  ["5415", "IT Services"],
  ["5112", "Software"],
  ["5132", "Software"],
  ["5182", "Cloud & Data Centres"],
  // Not IT in themselves, but this is where the desi staffing shops and the
  // consultancies that place developers file, so they are kept under their
  // own honest labels rather than being called IT firms.
  ["5613", "Staffing"],
  ["5416", "Consulting"],
];

function trade(naics: string) {
  return TRADES.find(([prefix]) => naics.startsWith(prefix))?.[1] ?? "";
}

/** The disclosure file on disk, downloaded the first time it is wanted. */
async function download() {
  const given = process.env.LCA_FILE;
  if (given) return given;

  const folder = join(tmpdir(), "godesi-lca");
  await mkdir(folder, { recursive: true });
  const path = join(folder, FILE);

  const already = await stat(path).catch(() => null);
  if (already && already.size > 1_000_000) return path;

  console.log(`h1b: fetching ${FILE} from dol.gov (~250 MB, once)`);
  const response = await fetch(`https://www.dol.gov/media/${FILE}`, {
    headers: { "User-Agent": "GodesiProspectReader/1.0 (+https://godesi.com)" },
  });
  if (!response.ok || !response.body) {
    throw new Error(`h1b: dol.gov returned ${response.status} for ${FILE}`);
  }
  const body = Readable.fromWeb(
    response.body as Parameters<typeof Readable.fromWeb>[0],
  );
  await pipeline(body, createWriteStream(path));
  return path;
}

type Firm = {
  name: string;
  trade: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  fein: string;
  /** Certified worker positions across the quarter: the size of the firm. */
  workers: number;
};

const COLUMNS = [
  "CASE_STATUS",
  "EMPLOYER_NAME",
  "TRADE_NAME_DBA",
  "EMPLOYER_ADDRESS1",
  "EMPLOYER_CITY",
  "EMPLOYER_STATE",
  "EMPLOYER_COUNTRY",
  "EMPLOYER_PHONE",
  "EMPLOYER_FEIN",
  "NAICS_CODE",
  "TOTAL_WORKER_POSITIONS",
] as const;

type Column = (typeof COLUMNS)[number];

function cell(row: ExcelJS.Row, at: number) {
  const value = row.getCell(at).value;
  if (value === null || value === undefined) return "";
  if (typeof value === "object" && "text" in value) return String(value.text);
  return String(value);
}

/** One row per employer, biggest first, with the filings folded together. */
async function firms() {
  const path = await download();
  const book = new ExcelJS.stream.xlsx.WorkbookReader(path, {
    entries: "emit",
    sharedStrings: "cache",
    worksheets: "emit",
  });

  const found = new Map<string, Firm>();
  let at: Record<Column, number> | null = null;

  for await (const sheet of book) {
    for await (const row of sheet) {
      if (!at) {
        const headers = new Map<string, number>();
        row.eachCell((value, index) => {
          headers.set(String(value.value ?? "").trim(), index);
        });
        if (!headers.has("EMPLOYER_NAME")) continue;
        at = Object.fromEntries(
          COLUMNS.map((name) => [name, headers.get(name) ?? 0]),
        ) as Record<Column, number>;
        continue;
      }

      if (cell(row, at.CASE_STATUS) !== "Certified") continue;
      const naics = cell(row, at.NAICS_CODE);
      const line = trade(naics);
      if (!line) continue;
      const country = cell(row, at.EMPLOYER_COUNTRY);
      if (country && country !== "UNITED STATES OF AMERICA") continue;

      const name = cell(row, at.TRADE_NAME_DBA) || cell(row, at.EMPLOYER_NAME);
      // Some filings leave the trading name as a dash or an N/A.
      if (name.replace(/[^a-z]/gi, "").length < 3) continue;
      if (/^n\s*\/?\s*a$/i.test(name.trim())) continue;
      const fein = cell(row, at.EMPLOYER_FEIN) || name.toUpperCase();

      const workers = Number(cell(row, at.TOTAL_WORKER_POSITIONS)) || 1;
      const existing = found.get(fein);
      if (existing) {
        existing.workers += workers;
        continue;
      }

      found.set(fein, {
        name,
        trade: line,
        address: cell(row, at.EMPLOYER_ADDRESS1),
        city: cell(row, at.EMPLOYER_CITY),
        state: cell(row, at.EMPLOYER_STATE).toUpperCase().slice(0, 2),
        phone: phone(cell(row, at.EMPLOYER_PHONE)),
        fein,
        workers,
      });
    }
  }

  return Array.from(found.values()).sort(
    (one, two) => two.workers - one.workers,
  );
}

export const h1b: Reader = {
  host: "dol.gov",
  filter: "state and trade, e.g. `nj ny` or `staffing tx`",
  async *read(only) {
    const words = only.map((word) => word.toLowerCase());
    const states = words.filter((word) => /^[a-z]{2}$/.test(word));
    const trades = words.filter((word) => !/^[a-z]{2}$/.test(word));

    const all = await firms();
    console.log(
      `dol.gov: ${all.length} US IT employers in the H-1B disclosure file`,
    );

    for (const firm of all) {
      if (states.length && !states.includes(firm.state.toLowerCase())) continue;
      if (
        trades.length &&
        !trades.some((word) => firm.trade.toLowerCase().includes(word))
      ) {
        continue;
      }

      const lead: Lead = {
        name: firm.name,
        trade: firm.trade,
        // The filings are published as one quarterly file, so the employer's
        // own number in it is what a moderator is shown as the provenance.
        sourceUrl: `${SOURCE}#lca-${encodeURIComponent(firm.fein)}`,
        phone: firm.phone,
        city: firm.city,
        state: firm.state,
        address: firm.address,
      };
      yield lead;
    }
  },
};
