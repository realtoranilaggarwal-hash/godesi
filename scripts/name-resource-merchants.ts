import { PrismaClient } from "@prisma/client";

/**
 * Affiliate links arrive as a network click URL with the advertiser's own
 * category as the title, so a box shows a dozen rows called "Peripherals".
 * Following the redirect gives the merchant, whose name reads properly in the
 * box; the old title is kept as a tag so the category filter still works.
 *
 * DRY=1 prints the rename without touching anything.
 */
const db = new PrismaClient();

const NETWORKS = [
  "jdoqocy.com",
  "tkqlhce.com",
  "anrdoezrs.net",
  "dpbolvw.net",
  "kqzyfj.com",
  "emjcd.com",
  "commission-junction.com",
  "cj.com",
  "dotomi.com",
  "ftjcfx.com",
  "afcyhf.com",
  "lduhtrp.net",
  "tqlkg.com",
  "awltovhc.com",
  "yceml.net",
  "qksrv.net",
  "apmebf.com",
  "cj.dotomi.com",
  "doubleclick.net",
  "go2cloud.org",
  "prf.hn",
  "bttn.io",
];

/** Some hops wrap the shop's address in a query parameter instead of a header. */
const WRAPPED = ["btn_url", "url", "u", "destination"];

/** True for the click trackers a network bounces through before the shop. */
function isNetwork(domain: string) {
  return NETWORKS.some(
    (network) => domain === network || domain.endsWith(`.${network}`),
  );
}

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function host(url: string) {
  try {
    return new URL(url).hostname
      .replace(/^(www|app|shop|store|secure|us|en|m)\./i, "")
      .toLowerCase();
  } catch {
    return "";
  }
}

async function hop(url: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);
  try {
    return await fetch(url, {
      redirect: "manual",
      headers: { "user-agent": UA },
      signal: controller.signal,
    });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** The shop's own page, read for its brand name. */
async function read(url: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: { "user-agent": UA },
      signal: controller.signal,
    });
    return await response.text();
  } catch {
    return "";
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Walks the network's redirects by hand. The merchant is the first address
 * outside the affiliate network — following to the very end lands on whichever
 * login or basket the shop bounces a robot to.
 */
async function resolve(url: string) {
  let current = url;
  for (let step = 0; step < 10; step += 1) {
    const response = await hop(current);
    if (!response) return null;

    const next = response.headers.get("location");
    if (!next || response.status < 300 || response.status >= 400) {
      return { finalUrl: current, html: await response.text() };
    }

    current = new URL(next, current).toString();
    const wrapped = WRAPPED.map((key) =>
      new URL(current).searchParams.get(key),
    ).find((value) => value?.startsWith("http"));
    if (wrapped && isNetwork(host(current))) current = wrapped;

    if (!isNetwork(host(current))) {
      return { finalUrl: current, html: await read(current) };
    }
  }
  return null;
}

/** "primecables.ca" → "Primecables"; a two-word brand stays as the site says. */
function fromDomain(domain: string) {
  const name = domain.split(".")[0].replace(/[-_]+/g, " ");
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function decode(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#0?39;|&apos;|&rsquo;/g, "’")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    // Shops pad titles with zero-width marks that would be stored verbatim.
    .replace(/[\u200b-\u200f\u202a-\u202e\ufeff]/g, "");
}

function squash(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * A page title is only trusted when it actually contains the merchant's own
 * domain word — that rejects "Access Denied" and marketing slogans, which is
 * what most of these destinations answer a robot with.
 */
function merchantName(html: string, domain: string, current: string) {
  const word = squash(domain.split(".")[0]);
  const siteName = html.match(
    /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i,
  )?.[1];
  const title = html.match(/<title[^>]*>([^<]{2,200})<\/title>/i)?.[1];

  const candidates = [siteName, ...(title ?? "").split(/[|\u2013\u2014\-:]/)]
    .map((value) => decode(value ?? "").replace(/\s+/g, " ").trim())
    .filter((value) => value.length >= 2 && value.length <= 40)
    .filter((value) => squash(value).includes(word));

  if (candidates[0]) return candidates[0];
  // The imported title is often the brand already, e.g. "Air India".
  if (squash(current) === word) return current;
  return fromDomain(domain);
}

const GENERIC_SECTIONS = [
  "index",
  "home",
  "fr",
  "en",
  "us",
  "shop",
  "lp",
  "r",
  "default",
  "store",
  "collections",
  "products",
  "pages",
];

/**
 * The shop's own section, read off the destination path, so a merchant with a
 * dozen links reads "PrimeCables — Cables" rather than a dozen identical rows.
 */
function sectionName(url: string) {
  let path: string;
  try {
    path = new URL(url).pathname;
  } catch {
    return "";
  }

  const segments = path
    .split("/")
    .filter(Boolean)
    // "/gifts/index.html" is the gifts section, not an "index" one.
    .filter((segment) => !/^index\.\w+$/i.test(segment));
  const words = (segments.pop() ?? "")
    .replace(/\.(html?|php|aspx?)$/i, "")
    .split(/[-_]+/)
    // Shops prefix a section with their own numbers, e.g. "c-18301-network".
    .filter(
      (word) =>
        word.length > 1 &&
        !/^\d+$/.test(word) &&
        !/^(c|channel)$/i.test(word),
    );

  const name = words.join(" ").trim();
  if (!name || GENERIC_SECTIONS.includes(name.toLowerCase())) return "";
  // Codes and stubs such as "applicationscreen1" or "ja" read as noise.
  if (name.length < 4 || name.length > 32 || /\d/.test(name)) return "";
  return name.charAt(0).toUpperCase() + name.slice(1);
}

async function main() {
  const dry = process.env.DRY === "1";
  const links = await db.resourceLink.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      title: true,
      url: true,
      tags: true,
      impressions: true,
      clicks: true,
      _count: { select: { orders: true } },
    },
  });

  const named = new Map<string, string>();
  // Several click URLs can land on one shop page; only the first is kept.
  const destinations = new Set<string>();
  const sameDestination: string[] = [];
  let renamed = 0;
  let failed = 0;

  for (const link of links) {
    if (!isNetwork(host(link.url))) continue;

    const resolved = await resolve(link.url);
    if (!resolved) {
      failed += 1;
      console.log(`  ! could not follow ${link.url}`);
      continue;
    }

    const domain = host(resolved.finalUrl);
    if (!domain || isNetwork(domain)) {
      failed += 1;
      console.log(`  ! stayed on the network: ${link.url}`);
      continue;
    }

    const merchant =
      named.get(domain) ?? merchantName(resolved.html, domain, link.title);
    named.set(domain, merchant);

    const destination = `${domain}${new URL(resolved.finalUrl).pathname
      // A shop's /fr page is the same page in another language.
      .replace(/^\/(fr|en|es|de|us)(\/|$)/i, "/")
      .replace(/\/+$/, "")}`;
    if (destinations.has(destination)) {
      if (link._count.orders === 0) {
        sameDestination.push(link.id);
        console.log(`  = same page as an earlier link: ${destination}`);
        continue;
      }
    }
    destinations.add(destination);

    const section = sectionName(resolved.finalUrl);
    const name =
      section && !squash(merchant).includes(squash(section))
        ? `${merchant} — ${section}`
        : merchant;
    if (name === link.title) continue;

    const tag = link.title.trim().slice(0, 30).toLowerCase();
    const tags = link.tags.includes(tag)
      ? link.tags
      : [...link.tags, tag].slice(0, 8);

    console.log(`${link.title} → ${name} (${resolved.finalUrl})`);
    if (!dry) {
      await db.resourceLink.update({
        where: { id: link.id },
        data: { title: name, tags },
      });
    }
    renamed += 1;
  }

  if (sameDestination.length && !dry) {
    await db.resourceLink.deleteMany({ where: { id: { in: sameDestination } } });
  }

  console.log(
    `${links.length} links read, ${renamed} ${dry ? "would be renamed" : "renamed"}, ${sameDestination.length} ${dry ? "land" : "landed"} on a page another link already covers, ${failed} could not be followed.`,
  );
}

main().finally(() => db.$disconnect());
