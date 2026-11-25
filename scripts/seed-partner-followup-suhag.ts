import { randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";

/** Daily partner reminders to Suhag Jewelers until he pays or Dec 1, 2026 ends (New York time). */
const db = new PrismaClient();

async function main() {
  const row = {
    email: "suhagjewelers@gmail.com",
    contactName: "Suhag",
    businessName: "Suhag Jewelers",
    deadline: new Date("2026-12-01T23:59:59-05:00"),
  };
  const existing = await db.partnerFollowUp.findFirst({ where: { email: row.email } });
  const followUp = existing
    ? await db.partnerFollowUp.update({ where: { id: existing.id }, data: row })
    : await db.partnerFollowUp.create({ data: { key: randomBytes(12).toString("base64url"), ...row } });
  console.log(followUp);
}

main().finally(() => db.$disconnect());
