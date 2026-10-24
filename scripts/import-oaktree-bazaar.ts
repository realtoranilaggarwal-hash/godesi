import { readFileSync } from "fs";
import { db } from "../src/lib/db";
import { uniqueSlug } from "../src/lib/uniqueSlug";

/**
 * Seeds unclaimed starter listings for the Oak Tree Road businesses listed in
 * scripts/data/oaktree-bazaar.json (compiled from the public business list on
 * oaktreeroadbazaar.com). Rows are created with no owner so the public
 * "Claim this business" panel applies, marked city=Iselin, and tagged with
 * their source page so re-runs refuse duplicates.
 *
 * On re-runs, ownerless imported rows only get EMPTY fields filled in —
 * values already on the card (including any staff corrections) are never
 * overwritten. The one exception is a description that still matches the
 * stub text this script originally wrote; that gets upgraded.
 * Pass OVERWRITE=1 to force-refresh every field (use once after a data fix,
 * knowing it discards staff edits on unclaimed cards).
 *
 *   npx tsx scripts/import-oaktree-bazaar.ts          # dry run
 *   APPLY=1 npx tsx scripts/import-oaktree-bazaar.ts
 *   APPLY=1 OVERWRITE=1 npx tsx scripts/import-oaktree-bazaar.ts
 */

type Row = {
  name: string;
  city: string;
  state?: string;
  categorySlug: string;
  subcategorySlug?: string | null;
  phone?: string | null;
  publicEmail?: string | null;
  websiteUrl?: string | null;
  address?: string | null;
  description?: string | null;
  specialties?: string[];
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  profileType?: string;
  sourceSlug: string;
};

const rows = JSON.parse(
  readFileSync(new URL("./data/oaktree-bazaar.json", import.meta.url), "utf8"),
) as Row[];

/** The one-line stub this importer wrote on the first run — safe to replace. */
const STUB_DESCRIPTION = /\bis an? Oak Tree Road business in\b/;

async function main() {
  const apply = process.env.APPLY === "1";
  const overwrite = process.env.OVERWRITE === "1";
  let created = 0;
  let updated = 0;
  const skipped: string[] = [];

  for (const row of rows) {
    const sourceUrl = `https://www.oaktreeroadbazaar.com/business/${row.sourceSlug}`;

    const category = await db.category.findUnique({
      where: { slug: row.categorySlug },
      include: { children: { select: { slug: true, name: true } } },
    });
    if (!category || category.parentSlug) {
      skipped.push(`${row.name} — unknown category ${row.categorySlug}`);
      continue;
    }
    const subcategory = row.subcategorySlug
      ? category.children.find((child) => child.slug === row.subcategorySlug)
      : undefined;

    const duplicate = await db.business.findFirst({
      where: {
        OR: [
          { sourceUrl },
          {
            name: { equals: row.name, mode: "insensitive" },
            city: { equals: row.city, mode: "insensitive" },
          },
        ],
      },
    });
    if (duplicate) {
      // Repair rows we imported earlier: refresh facts on ownerless cards.
      if (apply && !duplicate.ownerId && duplicate.sourceUrl === sourceUrl) {
        const data: Record<string, unknown> = {};
        /** Empty fields get filled; staff edits survive a re-import. */
        const fill = (field: keyof typeof duplicate, value: unknown) => {
          if (value !== undefined && (!duplicate[field] || overwrite)) {
            data[field] = value ?? null;
          }
        };
        fill("city", row.city);
        fill("state", row.state || null);
        fill("categorySlug", category.slug);
        fill("subcategorySlug", subcategory?.slug ?? null);
        fill("category", subcategory?.name ?? category.name);
        fill("phone", row.phone || null);
        fill("publicEmail", row.publicEmail || null);
        fill("websiteUrl", row.websiteUrl || null);
        fill("address", row.address || null);
        fill("instagramUrl", row.instagramUrl || null);
        fill("facebookUrl", row.facebookUrl || null);
        if (row.specialties?.length && (!duplicate.specialties?.length || overwrite)) {
          data.specialties = row.specialties;
        }
        if (
          row.description &&
          (!duplicate.description || STUB_DESCRIPTION.test(duplicate.description) || overwrite)
        ) {
          data.description = row.description;
        }
        data.country = "USA";
        await db.business.update({ where: { id: duplicate.id }, data });
        console.log(`updated ${row.name}`);
        updated++;
      } else {
        skipped.push(`${row.name} — already exists`);
      }
      continue;
    }

    console.log(
      `${apply ? "creating" : "would create"} ${row.name} — ${subcategory?.name ?? category.name}, ${row.city}`,
    );
    if (!apply) {
      created++;
      continue;
    }

    await db.business.create({
      data: {
        slug: await uniqueSlug(row.name, row.city),
        name: row.name,
        city: row.city,
        state: row.state || null,
        categorySlug: category.slug,
        subcategorySlug: subcategory?.slug ?? null,
        category: subcategory?.name ?? category.name,
        phone: row.phone || null,
        publicEmail: row.publicEmail || null,
        websiteUrl: row.websiteUrl || null,
        address: row.address || null,
        description: row.description || null,
        specialties: row.specialties ?? [],
        instagramUrl: row.instagramUrl || null,
        facebookUrl: row.facebookUrl || null,
        profileType: row.profileType === "PROFESSIONAL" ? "PROFESSIONAL" : "BUSINESS",
        country: "USA",
        status: "APPROVED",
        source: "oaktreeroadbazaar",
        sourceUrl,
      },
    });
    created++;
  }

  console.log(
    `\n${created} ${apply ? "created" : "to create"}, ${updated} updated, ${skipped.length} skipped`,
  );
  for (const line of skipped) console.log(`  - ${line}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
