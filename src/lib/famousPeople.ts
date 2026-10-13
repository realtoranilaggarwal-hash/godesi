import { db } from "@/lib/db";
import { uniqueEliteSlug } from "@/lib/eliteSlug";

/**
 * Well-known people for the event speaker picker, looked up on Wikipedia.
 * Only articles whose Wikidata item is a human (P31 = Q5) count, so a typed
 * "Shah Rukh" suggests the actor and not his filmography. Picking one gives
 * the speaker a GoDesi Elite profile compiled from the article.
 */

const WIKI_API = "https://en.wikipedia.org/w/api.php";
const WIKIDATA_API = "https://www.wikidata.org/w/api.php";
const WIKI_PAGE = "https://en.wikipedia.org/wiki/";
const AGENT = "GodesiEliteBot/1.0 (https://godesi.com; hello@godesi.com)";
const TIMEOUT_MS = 5000;

export type FamousMatch = {
  /** Wikipedia article title, e.g. "Shah Rukh Khan". */
  title: string;
  name: string;
  description: string | null;
  thumbUrl: string | null;
  wikiUrl: string;
  /** Slug of the Elite profile already made for this person, if any. */
  eliteSlug: string | null;
};

type WikiPage = {
  title: string;
  index?: number;
  missing?: string;
  description?: string;
  pageprops?: { wikibase_item?: string; disambiguation?: string };
  thumbnail?: { source?: string };
  pageimage?: string;
  original?: { source?: string };
  imageinfo?: { extmetadata?: Record<string, { value?: string }> }[];
};

type WikiQuery = { query?: { pages?: Record<string, WikiPage> } };

async function getJson<T>(base: string, params: Record<string, string>) {
  const search = new URLSearchParams({ format: "json", ...params });
  const response = await fetch(`${base}?${search}`, {
    headers: { "User-Agent": AGENT },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    next: { revalidate: 86400 },
  });
  if (!response.ok) throw new Error(`${new URL(base).host} ${response.status}`);
  return (await response.json()) as T;
}

/** Wikimedia tags its own analytics onto image URLs; keep the plain file. */
function plainUrl(url: string | undefined) {
  return url ? url.split("?")[0] : null;
}

/** "Rajeev Ram (tennis)" → "Rajeev Ram". */
function personName(title: string) {
  return title.replace(/\s*\([^)]*\)\s*$/, "").trim();
}

export function wikiUrl(title: string) {
  return WIKI_PAGE + encodeURIComponent(title.replace(/ /g, "_"));
}

/** The canonical URL plus the unencoded form older Elite imports stored. */
function sourceUrlsFor(title: string) {
  const plain = WIKI_PAGE + title.replace(/ /g, "_");
  return Array.from(new Set([wikiUrl(title), plain]));
}

async function isHuman(wikidataId: string) {
  const data = await getJson<{
    claims?: {
      P31?: { mainsnak?: { datavalue?: { value?: { id?: string } } } }[];
    };
  }>(WIKIDATA_API, {
    action: "wbgetclaims",
    entity: wikidataId,
    property: "P31",
  });
  return (data.claims?.P31 ?? []).some(
    (claim) => claim.mainsnak?.datavalue?.value?.id === "Q5",
  );
}

/** Up to `take` real people whose article title starts with the query. */
export async function searchFamousPeople(
  query: string,
  take = 4,
): Promise<FamousMatch[]> {
  const q = query.trim();
  if (q.replace(/\s/g, "").length < 4) return [];
  const data = await getJson<WikiQuery>(WIKI_API, {
    action: "query",
    generator: "prefixsearch",
    gpssearch: q,
    gpslimit: "8",
    prop: "pageprops|description|pageimages",
    ppprop: "wikibase_item|disambiguation",
    piprop: "thumbnail",
    pithumbsize: "120",
    redirects: "1",
  });
  const pages = Object.values(data.query?.pages ?? {})
    .filter(
      (page) =>
        page.pageprops?.wikibase_item && !("disambiguation" in page.pageprops),
    )
    .sort((a, b) => (a.index ?? 99) - (b.index ?? 99));

  const checked = await Promise.all(
    pages.map(async (page) => {
      try {
        return (await isHuman(page.pageprops!.wikibase_item!)) ? page : null;
      } catch {
        return null;
      }
    }),
  );
  const people = checked
    .filter((page): page is WikiPage => page !== null)
    .slice(0, take);
  if (!people.length) return [];

  const existing = await db.eliteEntry.findMany({
    where: {
      sourceUrl: { in: people.flatMap((page) => sourceUrlsFor(page.title)) },
      status: "PUBLISHED",
    },
    select: { sourceUrl: true, slug: true },
  });
  const slugByUrl = new Map(
    existing.map((entry) => [entry.sourceUrl, entry.slug]),
  );

  return people.map((page) => ({
    title: page.title,
    name: personName(page.title),
    description: page.description ?? null,
    thumbUrl: plainUrl(page.thumbnail?.source),
    wikiUrl: wikiUrl(page.title),
    eliteSlug:
      sourceUrlsFor(page.title)
        .map((url) => slugByUrl.get(url))
        .find(Boolean) ?? null,
  }));
}

/** Licences that allow reuse with credit. */
const FREE_LICENCES = [
  /^cc0/i,
  /^cc[ -]?by(?:[ -]sa)?(?:[ -]\d)?/i,
  /^public domain/i,
  /^pd/i,
];

function stripTags(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** The article's lead portrait when its licence allows reuse, with credit. */
async function freePortrait(page: WikiPage) {
  const url = plainUrl(page.original?.source);
  if (!page.pageimage || !url || /\.svg$/i.test(url)) return null;
  const info = await getJson<WikiQuery>(WIKI_API, {
    action: "query",
    titles: `File:${page.pageimage}`,
    prop: "imageinfo",
    iiprop: "extmetadata",
  });
  const meta =
    Object.values(info.query?.pages ?? {})[0]?.imageinfo?.[0]?.extmetadata ??
    {};
  const licence = stripTags(meta.LicenseShortName?.value ?? "");
  if (!licence || !FREE_LICENCES.some((pattern) => pattern.test(licence)))
    return null;
  const artist = stripTags(meta.Artist?.value ?? "").slice(0, 120);
  const credit = artist ? `${artist} · ${licence}` : licence;
  return { url, credit: `Photo: ${credit}, via Wikimedia Commons` };
}

/** Elite section for a Wikipedia short description such as "Indian actor". */
const CATEGORY_RULES: [RegExp, string][] = [
  [
    /actor|actress|singer|musician|composer|film|director|dancer|artist|poet|writer|author|comedian|television|presenter|journalist|producer/i,
    "Arts, Media & Music",
  ],
  [
    /cricket|tennis|athlete|footballer|player|boxer|wrestler|olympi|sport|coach|chess/i,
    "Sports & Fitness",
  ],
  [
    /politician|minister|governor|senator|congress|diplomat|ambassador|mayor|judge|civil servant|president of india|prime minister/i,
    "Public Service & Politics",
  ],
  [/lawyer|attorney|immigration/i, "Law & Immigration"],
  [/physician|doctor|surgeon|cardiolog|medic|health/i, "Healthcare"],
  [
    /engineer|computer|software|technolog|scientist|physicist|chemist|mathematician/i,
    "Technology",
  ],
  [/banker|economist|investor|financ|insurance/i, "Finance & Insurance"],
  [/chef|restaurat|cook/i, "Food & Hospitality"],
  [/spiritual|guru|religious|monk|swami|priest|yogi/i, "Religion & Culture"],
  [/professor|academic|educator|teacher/i, "Education"],
  [
    /activist|philanthropist|social worker|humanitarian/i,
    "Community & Non-profit",
  ],
  [
    /business|entrepreneur|executive|founder|industrialist|ceo/i,
    "Business & Entrepreneurship",
  ],
];

function categoryFor(description: string | null) {
  if (!description) return "Other";
  return (
    CATEGORY_RULES.find(([pattern]) => pattern.test(description))?.[1] ??
    "Other"
  );
}

/**
 * The published Elite profile for the person a Wikipedia article is about,
 * compiled from that article the first time anybody picks them. Null when the
 * article is missing or not about a person.
 */
export async function eliteForFamousSpeaker(
  title: string,
): Promise<string | null> {
  const data = await getJson<WikiQuery>(WIKI_API, {
    action: "query",
    titles: title.slice(0, 200),
    prop: "pageprops|description|pageimages",
    ppprop: "wikibase_item",
    piprop: "original|name",
    redirects: "1",
  });
  const page = Object.values(data.query?.pages ?? {})[0];
  const wikidataId = page?.pageprops?.wikibase_item;
  if (!page || page.missing !== undefined || !wikidataId) return null;

  const sourceUrl = wikiUrl(page.title);
  const existing = await db.eliteEntry.findFirst({
    where: { sourceUrl: { in: sourceUrlsFor(page.title) } },
    select: { id: true },
  });
  if (existing) return existing.id;
  if (!(await isHuman(wikidataId))) return null;

  const name = personName(page.title);
  const description = page.description ?? null;
  const photo = await freePortrait(page).catch(() => null);
  const entry = await db.eliteEntry.upsert({
    where: { sourceUrl },
    update: {},
    create: {
      slug: await uniqueEliteSlug(name),
      fullName: name,
      category: categoryFor(description),
      city: "",
      shortBio: description
        ? `${description.charAt(0).toUpperCase()}${description.slice(1)}.`
        : `${name} — see Wikipedia for their story.`,
      sourceUrl,
      sourceName: "Wikipedia",
      photoUrl: photo?.url ?? null,
      photoCredit: photo?.credit ?? null,
      nominationType: "OTHER",
      nomineeName: name,
      status: "PUBLISHED",
      badge: "BASIC",
      publishedAt: new Date(),
      adminNote:
        "Added automatically when an organiser picked this person as an event speaker. Compiled from Wikipedia; unclaimed until the person claims it.",
    },
    select: { id: true },
  });
  return entry.id;
}
