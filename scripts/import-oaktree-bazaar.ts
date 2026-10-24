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
 *   npx tsx scripts/import-oaktree-bazaar.ts          # dry run
 *   APPLY=1 npx tsx scripts/import-oaktree-bazaar.ts
 */

type Row = {
  name: string;
  city: string;
  state?: string;
  categorySlug: string;
  subcategorySlug?: string | null;
  phone?: string | null;
  websiteUrl?: string | null;
  address?: string | null;
  description?: string | null;
  profileType?: string;
  sourceSlug: string;
};

const rows = JSON.parse(
  readFileSync(new URL("./data/oaktree-bazaar.json", import.meta.url), "utf8"),
) as Row[];

async function main() {
  const apply = process.env.APPLY === "1";
  let created = 0;
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
      select: { id: true },
    });
    if (duplicate) {
      skipped.push(`${row.name} — already exists`);
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
        websiteUrl: row.websiteUrl || null,
        address: row.address || null,
        description: row.description || null,
        profileType: row.profileType === "PROFESSIONAL" ? "PROFESSIONAL" : "BUSINESS",
        status: "APPROVED",
        source: "oaktreeroadbazaar",
        sourceUrl,
      },
    });
    created++;
  }

  console.log(`\n${created} ${apply ? "created" : "to create"}, ${skipped.length} skipped`);
  for (const line of skipped) console.log(`  - ${line}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
