/**
 * Puts a YouTube Short on each top-level category page (the help clip at the
 * top of the sidebar, with "Browse this category →" under it).
 *
 * Paste the Shorts link next to a category as each video goes live, then run:
 *   npx tsx scripts/seed-help-clips.ts            # writes to the database
 *   npx tsx scripts/seed-help-clips.ts --dry-run  # only prints what it would do
 *
 * Entries with an empty `url` are skipped. Running it again updates the clip
 * already saved for that category instead of adding a second one, and leaves
 * a clip staff switched off in admin switched off.
 */
import { db } from "../src/lib/db";
import { CATEGORY_TREE, subcategorySlug } from "../src/lib/categories";
import { CLIP_SECTIONS } from "../src/lib/clipSections";
import { videoEmbedUrl } from "../src/lib/video";

type ClipSeed = {
  /** Card title shown over the video. */
  title: string;
  /** YouTube Shorts link, e.g. https://youtube.com/shorts/AbC123xyz */
  url: string;
  /** Optional one line under the title. */
  note?: string;
};

/**
 * Keys are directory category slugs (pages under /categories/…) or
 * `section:` slugs for site sections outside the directory.
 */
const CLIPS: Record<string, ClipSeed> = {
  "food-catering": { title: "Find desi restaurants & caterers", url: "" },
  // jobs and events-wedding already have clips added in admin; leave the
  // url empty here so the script does not replace them.
  "events-wedding": { title: "Plan your desi wedding", url: "" },
  "events-wedding-dj-and-sound": {
    title: "List your DJ business free",
    url: "https://youtube.com/shorts/GlaZvg4SK5U",
  },
  "real-estate": {
    title: "Find real estate opportunities",
    url: "https://youtube.com/shorts/anxkEnohkbk",
  },
  "rooms-roommates": { title: "Find a room or roommate", url: "" },
  jobs: { title: "Desi jobs & freelancers", url: "" },
  "section:gigs": {
    title: "Hire a desi expert from $5",
    url: "https://youtube.com/shorts/twW83QrB_b0",
  },
  "section:events": { title: "Desi events near you", url: "" },
  "section:festivals": {
    title: "Promote your festival event",
    url: "https://youtube.com/shorts/BSlRup0hcqw",
  },
  "section:complaints": {
    title: "How to file a complaint",
    url: "https://youtube.com/shorts/XWSaSZIQEAw",
  },
  "section:elite": {
    title: "Join as a GoDesi Elite member",
    url: "https://youtube.com/shorts/cjYvs3e-Iak",
  },
  "religious-services": {
    title: "Book a pooja live from India",
    url: "https://youtube.com/shorts/a69a2spb2dQ",
  },
  "religious-services-temples-and-trusts": {
    title: "Temples near you",
    url: "",
  },
  "religious-services-astrologers": {
    title: "Consult expert astrologers",
    url: "https://youtube.com/shorts/yn_aeuzaOe0",
  },
  "section:astrology": {
    title: "Free astrology on GoDesi",
    url: "https://youtube.com/shorts/ezizkg7yuVc",
  },
  "buy-sell": { title: "Buy & sell in the desi marketplace", url: "" },
  "section:news": {
    title: "Become a desi journalist",
    url: "https://youtube.com/shorts/HZB4pXzMrmE",
  },
  "section:live": {
    title: "Live desi radio & TV",
    url: "https://youtube.com/shorts/4wx4CiPkfEE",
  },
  "section:rishta": { title: "Find a rishta", url: "" },
  travel: {
    title: "Save on flights & hotels",
    url: "https://youtube.com/shorts/cvmSReLD9O8",
  },
  professionals: { title: "Desi attorneys, CPAs & experts", url: "" },
};

const KNOWN_SLUGS = new Set<string>([
  ...CLIP_SECTIONS.map((section) => section.slug),
  ...CATEGORY_TREE.flatMap((category) => [
    category.slug,
    ...category.children.map((child) => subcategorySlug(category.slug, child)),
  ]),
]);

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  let saved = 0;

  for (const [categorySlug, seed] of Object.entries(CLIPS)) {
    if (!KNOWN_SLUGS.has(categorySlug)) {
      console.warn(
        `✗ ${categorySlug}: not a category or section slug, skipped`,
      );
      continue;
    }
    const url = seed.url.trim();
    if (!url) {
      console.log(`· ${categorySlug}: no video yet`);
      continue;
    }
    if (!videoEmbedUrl(url)) {
      console.warn(`✗ ${categorySlug}: not a YouTube/Vimeo link, skipped`);
      continue;
    }

    const existing = await db.helpClip.findFirst({
      where: { categorySlug },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: { id: true },
    });
    const data = {
      title: seed.title,
      url,
      note: seed.note ?? null,
      categorySlug,
    };

    if (dryRun) {
      console.log(
        `→ ${categorySlug}: would ${existing ? "update" : "add"} ${url}`,
      );
    } else if (existing) {
      await db.helpClip.update({ where: { id: existing.id }, data });
      console.log(`✓ ${categorySlug}: updated ${url}`);
    } else {
      await db.helpClip.create({ data: { ...data, active: true } });
      console.log(`✓ ${categorySlug}: added ${url}`);
    }
    saved += 1;
  }

  console.log(`${dryRun ? "Would save" : "Saved"} ${saved} clip(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
