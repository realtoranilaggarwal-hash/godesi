import { PrismaClient } from "@prisma/client";

/**
 * One-off: "Real Estate Agents" existed under both Real Estate & Homes and
 * Professionals & Experts. Everything moves to the Real Estate one.
 */
const OLD = "professionals-realtors";
const NEW = "real-estate-property-dealers";

async function main() {
  const db = new PrismaClient();
  try {
    const moved = await db.business.updateMany({
      where: { subcategorySlug: OLD },
      data: { subcategorySlug: NEW, categorySlug: "real-estate" },
    });
    const events = await db.event.updateMany({
      where: { categorySlug: OLD },
      data: { categorySlug: NEW },
    });
    const removed = await db.category.deleteMany({ where: { slug: OLD } });
    console.log(
      `Moved ${moved.count} businesses, ${events.count} events; removed ${removed.count} category`,
    );
  } finally {
    await db.$disconnect();
  }
}

main();
