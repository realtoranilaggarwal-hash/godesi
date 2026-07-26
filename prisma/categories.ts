import { PrismaClient } from "@prisma/client";
import { CATEGORY_TREE, subcategorySlug } from "../src/lib/categories";

/**
 * Idempotent taxonomy sync — safe to run against production on every deploy.
 * Only touches the `Category` table.
 */
export async function syncCategories(db: PrismaClient) {
  let count = 0;

  for (let index = 0; index < CATEGORY_TREE.length; index += 1) {
    const category = CATEGORY_TREE[index];
    const data = {
      name: category.name,
      icon: category.icon,
      color: category.color,
      blurb: category.blurb,
      sortOrder: index,
      parentSlug: null,
    };
    await db.category.upsert({
      where: { slug: category.slug },
      create: { slug: category.slug, ...data },
      update: data,
    });
    count += 1;

    for (let childIndex = 0; childIndex < category.children.length; childIndex += 1) {
      const child = category.children[childIndex];
      const slug = subcategorySlug(category.slug, child);
      const childData = {
        name: child,
        icon: category.icon,
        color: category.color,
        sortOrder: childIndex,
        parentSlug: category.slug,
      };
      await db.category.upsert({
        where: { slug },
        create: { slug, ...childData },
        update: childData,
      });
      count += 1;
    }
  }

  return count;
}

if (require.main === module) {
  const db = new PrismaClient();
  syncCategories(db)
    .then((count) => console.log(`Synced ${count} categories`))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(() => db.$disconnect());
}
