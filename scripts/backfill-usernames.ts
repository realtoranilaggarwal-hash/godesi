import { PrismaClient } from "@prisma/client";
import { ensureUsername } from "../src/lib/profiles";

/** Gives every confirmed member without a handle a page at godesi.com/<handle>. */
const db = new PrismaClient();

async function main() {
  const users = await db.user.findMany({
    where: { username: null, emailVerifiedAt: { not: null }, bannedAt: null },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  for (const user of users) {
    // eslint-disable-next-line no-await-in-loop
    await ensureUsername(user.id);
  }
  console.log(`backfilled ${users.length}`);
}

main().finally(() => db.$disconnect());
