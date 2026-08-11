import { PrismaClient } from "@prisma/client";
import { canonicalEmail } from "../src/lib/signupGuard";

/** Fills emailCanonical for accounts created before alias detection existed. */
const db = new PrismaClient();

async function main() {
  const users = await db.user.findMany({
    where: { emailCanonical: null },
    select: { id: true, email: true },
  });
  for (const user of users) {
    await db.user.update({
      where: { id: user.id },
      data: { emailCanonical: canonicalEmail(user.email) },
    });
  }
  console.log(`backfilled ${users.length}`);
}

main().finally(() => db.$disconnect());
