/**
 * Puts a freely-licensed portrait on each staff-compiled Elite profile.
 *
 * Only pictures whose licence allows reuse are taken (public domain, CC0,
 * CC BY, CC BY-SA), and the photographer and licence are stored with the
 * picture so the profile can credit them. Anyone whose only portrait is
 * non-free keeps the placeholder until they claim the profile.
 *
 *   npm run db:elite-photos
 */
import { db } from "../src/lib/db";

const API = "https://en.wikipedia.org/w/api.php";
const AGENT = "GodesiEliteBot/1.0 (https://godesi.com; hello@godesi.com)";

/** Licences that allow reuse with credit. */
const FREE = [
  /^cc0/i,
  /^cc[ -]?by(?:[ -]sa)?(?:[ -]\d)?/i,
  /^public domain/i,
  /^pd/i,
];

type ImageInfo = {
  extmetadata?: Record<string, { value?: string }>;
};

type Page = {
  title: string;
  missing?: string;
  pageimage?: string;
  original?: { source?: string };
  imageinfo?: ImageInfo[];
};

type QueryResult = {
  query?: { pages?: Record<string, Page>; normalized?: { from: string; to: string }[] };
};

async function api(params: Record<string, string>): Promise<QueryResult> {
  const search = new URLSearchParams({ format: "json", action: "query", ...params });
  const response = await fetch(`${API}?${search}`, { headers: { "User-Agent": AGENT } });
  if (!response.ok) throw new Error(`Wikipedia ${response.status}`);
  return (await response.json()) as QueryResult;
}

function stripTags(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleFromSource(sourceUrl: string) {
  const match = /\/wiki\/([^#?]+)/.exec(sourceUrl);
  return match ? decodeURIComponent(match[1]).replace(/_/g, " ") : null;
}

/** True when the article is the person's own, not their company's. */
function isAbout(title: string, fullName: string) {
  const article = title.toLowerCase();
  return fullName
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .every((word) => article.includes(word));
}

/** The lead portrait of an article, with its licence, or null if unusable. */
async function portrait(title: string) {
  const lead = await api({
    titles: title,
    prop: "pageimages",
    piprop: "original|name",
    redirects: "1",
  });
  const page = Object.values(lead.query?.pages ?? {})[0];
  if (!page || page.missing !== undefined) return null;

  const file = page.pageimage;
  // The API tags its own analytics onto the URL; store the plain file.
  const url = page.original?.source?.split("?")[0];
  if (!file || !url) return null;
  if (/\.svg$/i.test(url)) return null;

  const info = await api({
    titles: `File:${file}`,
    prop: "imageinfo",
    iiprop: "extmetadata",
  });
  const meta = Object.values(info.query?.pages ?? {})[0]?.imageinfo?.[0]?.extmetadata ?? {};
  const licence = stripTags(meta.LicenseShortName?.value ?? "");
  if (!licence || !FREE.some((pattern) => pattern.test(licence))) return null;

  const artist = stripTags(meta.Artist?.value ?? "").slice(0, 120);
  const credit = artist ? `${artist} · ${licence}` : licence;
  return { url, credit: `Photo: ${credit}, via Wikimedia Commons` };
}

async function main() {
  const entries = await db.eliteEntry.findMany({
    where: {
      userId: null,
      sourceUrl: { contains: "wikipedia.org" },
      photoUrl: null,
    },
    select: { id: true, fullName: true, sourceUrl: true },
    orderBy: { createdAt: "asc" },
  });

  let added = 0;
  let skipped = 0;

  for (const entry of entries) {
    const title = entry.sourceUrl ? titleFromSource(entry.sourceUrl) : null;
    // A source about the person's restaurant or company illustrates the place,
    // not the person, so only their own article is used for a portrait.
    if (!title || !isAbout(title, entry.fullName)) {
      skipped += 1;
      continue;
    }

    try {
      const picture = await portrait(title);
      if (!picture) {
        skipped += 1;
        console.log(`no free portrait: ${entry.fullName}`);
        continue;
      }
      await db.eliteEntry.update({
        where: { id: entry.id },
        data: { photoUrl: picture.url, photoCredit: picture.credit },
      });
      added += 1;
      console.log(`${entry.fullName}: ${picture.credit}`);
    } catch (error) {
      skipped += 1;
      console.log(`failed: ${entry.fullName} — ${(error as Error).message}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  console.log(`Elite photos: ${added} added, ${skipped} left without one.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
