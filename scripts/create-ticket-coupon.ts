/**
 * Issues a ticket coupon for one event, e.g. a one-use free-ticket code for a buyer
 * who paid by Zelle:
 *
 *   DATABASE_URL=... npx tsx scripts/create-ticket-coupon.ts --code RAVI-XYZ \
 *     --event new-year-eves-party-2027-edison --percent 100 --max 1
 *
 * --percent defaults to 100 and --max to 1. The code only works on that event's tickets,
 * once per member, and the 100% code makes the booking free so it confirms without payment.
 * A percent code covers the whole booking (up to 10 tickets), so to cap a code at what the
 * buyer paid, pass --amount 180 instead: a fixed discount in the event's currency.
 */
import { parseArgs } from "node:util";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

function normalizeCouponCode(input: string) {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}

async function main() {
  const { values } = parseArgs({
    options: {
      code: { type: "string" },
      event: { type: "string" },
      percent: { type: "string", default: "100" },
      max: { type: "string", default: "1" },
      amount: { type: "string" },
    },
  });
  const code = normalizeCouponCode(values.code ?? "");
  const percent = Number(values.percent);
  const max = Number(values.max);
  const amount = values.amount === undefined ? null : Number(values.amount);
  if (!code || !values.event)
    throw new Error("Usage: --code RAVI-XYZ --event <slug> [--percent 100 | --amount 180] [--max 1]");
  if (amount !== null && (!Number.isInteger(amount) || amount < 1))
    throw new Error("--amount must be a whole number of at least 1");
  if (!Number.isInteger(percent) || percent < 1 || percent > 100)
    throw new Error("--percent must be a whole number from 1 to 100");
  if (!Number.isInteger(max) || max < 1) throw new Error("--max must be a whole number of at least 1");

  const event = await db.event.findUnique({
    where: { slug: values.event },
    select: { id: true, slug: true, title: true, currency: true },
  });
  if (!event) throw new Error(`No event with slug ${values.event}`);
  if (await db.coupon.findUnique({ where: { code } })) throw new Error(`Coupon ${code} already exists`);

  await db.coupon.create({
    data: {
      code,
      scope: "TICKETS",
      discountKind: amount === null ? "PERCENT" : "FIXED",
      amount: amount ?? percent,
      currency: amount === null ? null : event.currency,
      eventId: event.id,
      maxRedemptions: max,
    },
  });
  const off = amount === null ? `${percent}%` : `${event.currency} ${amount}`;
  console.log(`Created ${code}: ${off} off ${event.title} tickets, ${max} use(s).`);
  console.log(`Book at https://godesi.com/events/${event.slug} and enter the code at checkout.`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
