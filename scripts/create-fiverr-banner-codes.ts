/**
 * Makes one-time codes Anil hands to Fiverr buyers: each code books one month
 * of a 320x100 Small banner (slot MOBILE) free, since the buyer already paid on
 * Fiverr. A code works once, only on that placement, and only for 1 month.
 *
 *   DATABASE_URL=... npx tsx scripts/create-fiverr-banner-codes.ts [count]
 */
import { randomInt } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function newCode() {
  let tail = "";
  for (let i = 0; i < 6; i++) tail += LETTERS[randomInt(LETTERS.length)];
  return `FIVERR-${tail}`;
}

async function main() {
  const count = Number(process.argv[2] ?? 20);
  const codes: string[] = [];
  while (codes.length < count) {
    const code = newCode();
    const taken = await db.coupon.findUnique({ where: { code } });
    if (taken) continue;
    await db.coupon.create({
      data: {
        code,
        scope: "ADS",
        discountKind: "PERCENT",
        amount: 100,
        maxRedemptions: 1,
        bannerSlot: "MOBILE",
        adMonths: 1,
      },
    });
    codes.push(code);
  }
  console.log(codes.join("\n"));
}

main().finally(() => db.$disconnect());
