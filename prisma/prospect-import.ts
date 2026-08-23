import { db } from "../src/lib/db";
import { guessCategory, readBusinessLink } from "../src/lib/businessLink";
import { titleCase } from "../src/lib/titlecase";
import { deshvidesh } from "./prospects/deshvidesh";
import { indianweddings } from "./prospects/indianweddings";
import { jabwewed } from "./prospects/jabwewed";
import { localfiles } from "./prospects/localfiles";
import { shaadishop } from "./prospects/shaadishop";
import { wedbae } from "./prospects/wedbae";
import { weddingconnect } from "./prospects/weddingconnect";
import { weddingfile } from "./prospects/weddingfile";
import {
  page,
  pause,
  phone as dialable,
  type Lead,
  type Reader,
} from "./prospects/shared";

/**
 * Builds the moderators' call list from public desi directories.
 *
 *   npm run db:prospects -- localfiles                 # 43 US metros
 *   npm run db:prospects -- localfiles new_jersey      # one metro
 *   npm run db:prospects -- deshvidesh disc-jockey     # one trade
 *   npm run db:prospects -- jabwewed
 *   npm run db:prospects -- indianweddings              # US wedding vendors
 *   npm run db:prospects -- shaadishop texas             # one region's list
 *   npm run db:prospects -- weddingconnect               # US wedding suppliers
 *
 * A business already listed somewhere is the warmest lead we have, so we read
 * these directories for facts only: who exists, what they do, and how to ring
 * them. Where a source prints no number, the business's own website is read
 * instead — fairer and more accurate than a directory's back pages.
 *
 * Nothing here is published. Rows land in /admin/prospects for a moderator to
 * ring; the business gets a card only when its owner makes one. No description,
 * photo or logo is ever copied from a directory — the only words and logo kept
 * are the ones the business publishes on its own domain, and even those are
 * only a draft the owner has to approve on the call.
 */

const READERS: Record<string, Reader> = {
  deshvidesh,
  indianweddings,
  jabwewed,
  localfiles,
  shaadishop,
  wedbae,
  weddingconnect,
  weddingfile,
};

type Facts = {
  phone: string;
  email: string;
  city: string;
  state: string;
  address: string;
  categorySlug: string;
  subcategorySlug: string;
  /** Their own description of themselves, for the owner to approve or replace. */
  about: string;
};

const EMPTY: Facts = {
  phone: "",
  email: "",
  city: "",
  state: "",
  address: "",
  categorySlug: "",
  subcategorySlug: "",
  about: "",
};

/** What the business itself publishes: the part a moderator needs to ring. */
async function fromOwnSite(website: string): Promise<Facts> {
  try {
    const draft = await readBusinessLink(website);
    return {
      phone: draft.phone,
      email: draft.email,
      city: draft.city,
      state: draft.state,
      address: draft.address,
      categorySlug: draft.categorySlug,
      subcategorySlug: draft.subcategorySlug,
      about: draft.about.slice(0, 600),
    };
  } catch {
    return EMPTY;
  }
}

/**
 * The logo a business publishes on its own domain. Only an image served from
 * their own site counts — an og:image on a directory page belongs to the
 * directory, and a stock photo helps nobody.
 */
async function ownLogo(website: string) {
  const html = await page(website);
  await pause();
  if (!html) return "";

  const candidates = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i,
    /"logo"\s*:\s*"([^"]+)"/i,
    /"logo"\s*:\s*\{[^}]*"url"\s*:\s*"([^"]+)"/i,
  ];

  for (const pattern of candidates) {
    const found = html.match(pattern)?.[1];
    if (!found) continue;
    try {
      const image = new URL(found.replace(/\\\//g, "/"), website);
      const site = new URL(website);
      const root = (host: string) => host.split(".").slice(-2).join(".");
      if (root(image.hostname) === root(site.hostname)) return image.toString();
    } catch {
      continue;
    }
  }
  return "";
}

/**
 * The source's facts, topped up from the business's own website only where the
 * source left a gap — and only bothering with the fetch when there is no way
 * to ring them yet.
 */
async function contact(lead: Lead) {
  const own = lead.websiteUrl ? await fromOwnSite(lead.websiteUrl) : EMPTY;
  const logo = lead.websiteUrl ? await ownLogo(lead.websiteUrl) : "";
  return {
    about: own.about,
    logoUrl: logo,
    // A number a moderator can't dial is worse than a blank: it wastes a call.
    phone: dialable(lead.phone ?? "") || dialable(own.phone),
    email: lead.email || own.email,
    city: lead.city || own.city,
    state: lead.state || own.state,
    // Own-site addresses arrive as a postal block; a call sheet wants one line.
    address: (lead.address || own.address).replace(/\s+/g, " ").trim(),
    categorySlug: own.categorySlug || guessCategory(lead.trade),
    subcategorySlug: own.subcategorySlug,
  };
}

async function main() {
  const [name, ...only] = process.argv.slice(2);
  const reader = READERS[name ?? ""];
  if (!reader) {
    console.error(
      `Pick a source: ${Object.keys(READERS).join(", ")}\n` +
        Object.entries(READERS)
          .map(([key, source]) => `  ${key} — narrow with ${source.filter}`)
          .join("\n"),
    );
    process.exit(1);
  }

  /** DRY=1 prints what a run would save, so a source can be checked first. */
  const dry = process.env.DRY === "1";

  let seen = 0;
  let saved = 0;
  let reachable = 0;

  for await (const lead of reader.read(only)) {
    seen += 1;

    const existing = dry
      ? null
      : await db.prospect.findUnique({
          where: { sourceUrl: lead.sourceUrl },
          select: { status: true },
        });
    // A row a moderator has already worked is left exactly as it is.
    if (existing && existing.status !== "NEW") continue;

    const found = await contact(lead);
    if (found.phone || found.email) reachable += 1;

    const data = {
      name: titleCase(lead.name),
      trade: titleCase(lead.trade),
      categorySlug: found.categorySlug || null,
      subcategorySlug: found.subcategorySlug || null,
      city: found.city ? titleCase(found.city) : null,
      state: found.state ? found.state.toUpperCase().slice(0, 2) : null,
      address: found.address || null,
      phone: found.phone || null,
      email: found.email || null,
      websiteUrl: lead.websiteUrl || null,
      source: reader.host,
      draftAbout: found.about || null,
      draftLogoUrl: found.logoUrl || null,
    };

    if (dry) {
      console.log(
        [data.name, data.trade, data.phone, data.city, data.state, data.address]
          .map((value) => value ?? "-")
          .join(" | "),
      );
    } else {
      await db.prospect.upsert({
        where: { sourceUrl: lead.sourceUrl },
        create: { ...data, sourceUrl: lead.sourceUrl },
        update: data,
      });
    }
    saved += 1;

    if (saved % 200 === 0) console.log(`  …${saved} saved`);
  }

  console.log(
    `${seen} listings read, ${saved} saved, ${reachable} with a phone or email to ring.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
