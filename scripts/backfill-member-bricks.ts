import { db } from "../src/lib/db";
import { assignMemberBrick } from "../src/lib/memberBricks";

async function main() {
  const users = await db.user.findMany({
    where: {
      adOrders: { none: { wallBlockId: { not: null }, provider: "free" } },
    },
    select: { id: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  console.log(`${users.length} members without a free brick`);
  let placed = 0;
  for (const u of users) {
    const b = await assignMemberBrick(u.id);
    if (b) placed++;
  }
  console.log(`placed ${placed}`);
}
main().finally(() => db.$disconnect());
