import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { put } from "@vercel/blob";

/**
 * Books Master Bedina's $500 paid spot on the Wall of Fame: 50 desi bricks
 * (100x50 px) in the top-most free rectangle, live immediately, plus a PAID
 * manual AdOrder so the $500 is on record. Creates his unclaimed astrologer
 * card first if it is missing. Re-runnable: an existing block is kept.
 *
 *   npx tsx scripts/add-master-bedina-wall.ts
 */

const prisma = new PrismaClient();

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://godesi.com").replace(/\/$/, "");
const SLUG = "master-bedina-astrologer";
const TITLE = "Master Bedina — Astrologer & Psychic";
const W = 100;
const H = 50;
const BOARD = 1000;
const FREE_Y = 900; // bottom band of the board is the free zone
const AMOUNT_MINOR = 50_000; // $500.00
const REFERENCE = "manual:wall:master-bedina";
const IMAGE_FILE = "public/images/wall/master-bedina.jpg";

const description =
  "Master Bedina is a famous astrologer, psychic and spiritualist — astrology is God's gift, passed down in his family from generation to generation. " +
  "He gives expert palm, face, photo, horoscope and numerology readings, and offers quick solutions for job and career, education, business and finances, " +
  "marriage and relationships, children, health and sickness, court cases and political matters. He also offers removal of black magic and evil spirits " +
  "with life-long protection. Arise, wake up, and don't stop until your goal is achieved — call Master Bedina at (646) 382-7477 or email sanhatiusa@gmail.com to book a reading.";

const cardDescription = [
  "Master Bedina is an astrologer, psychic and spiritualist who describes astrology as a gift passed down in his family from generation to generation.",
  "",
  "Readings offered: palm reading, face reading, photo reading, horoscope reading and numerology.",
  "",
  "People consult him for guidance on job and career, education, business, finances, marriage and relationships, children and family, and health.",
  "",
  "Call (646) 382-7477 or email sanhatiusa@gmail.com to book a reading.",
].join("\n");

async function astrologerCard() {
  const existing = await prisma.business.findUnique({ where: { slug: SLUG } });
  if (existing) return existing;
  return prisma.business.create({
    data: {
      slug: SLUG,
      name: "Master Bedina — Famous Astrologer, Psychic & Spiritualist",
      profileType: "PROFESSIONAL",
      category: "religious-services",
      categorySlug: "religious-services",
      subcategorySlug: "religious-services-astrologers",
      city: "New York",
      state: "NY",
      country: "USA",
      description: cardDescription,
      phone: "(646) 382-7477",
      publicEmail: "sanhatiusa@gmail.com",
      status: "APPROVED",
    },
  });
}

/** Top-most, then left-most free WxH rectangle on the 10px brick grid. */
async function freeSpot() {
  const taken = await prisma.wallBlock.findMany({
    where: { status: { in: ["DRAFT", "PENDING", "ACTIVE"] } },
    select: { x: true, y: true, w: true, h: true },
  });
  const overlaps = (x: number, y: number) =>
    taken.some((b) => x < b.x + b.w && x + W > b.x && y < b.y + b.h && y + H > b.y);
  for (let y = 0; y + H <= FREE_Y; y += 10) {
    for (let x = 0; x + W <= BOARD; x += 10) {
      if (!overlaps(x, y)) return { x, y };
    }
  }
  throw new Error(`No free ${W}x${H} spot left above the free zone`);
}

/** Vercel Blob when a token is set (live without a deploy), else the public/ file. */
async function bannerUrl(ownerId: string) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return `/${IMAGE_FILE.replace(/^public\//, "")}`;
  const file = await readFile(path.join(process.cwd(), IMAGE_FILE));
  const blob = await put(`banners/${ownerId}/master-bedina-wall.jpg`, file, {
    access: "public",
    addRandomSuffix: true,
    contentType: "image/jpeg",
  });
  return blob.url;
}

async function main() {
  const card = await astrologerCard();
  console.log(`card: ${card.id} -> ${SITE}/business/${card.slug} (owner ${card.ownerId ?? "none"})`);

  // His own account when he has claimed the card; otherwise the site admin
  // holds the order and the vendor list falls back to the block title.
  const admin = await prisma.user.findUniqueOrThrow({ where: { email: "godesibiz@gmail.com" } });
  const advertiserId = card.ownerId;
  const orderUserId = card.ownerId ?? admin.id;

  const existing = await prisma.adOrder.findUnique({
    where: { reference: REFERENCE },
    include: { wallBlock: true },
  });
  if (existing?.wallBlock) {
    const b = existing.wallBlock;
    console.log(`Already booked: block ${b.id} at ${b.x},${b.y} ${b.w}x${b.h} (${b.status}), order ${existing.id}`);
    return;
  }

  const spot = await freeSpot();
  const imageUrl = await bannerUrl(orderUserId);

  const { block, order } = await prisma.$transaction(async (tx) => {
    const block = await tx.wallBlock.create({
      data: {
        ...spot,
        w: W,
        h: H,
        title: TITLE,
        imageUrl,
        linkUrl: `${SITE}/business/${card.slug}`,
        description,
        status: "ACTIVE",
        advertiserId,
      },
    });
    const order = await tx.adOrder.create({
      data: {
        userId: orderUserId,
        wallBlockId: block.id,
        slot: "WALL",
        amountMinor: AMOUNT_MINOR,
        currency: "USD",
        provider: "manual",
        reference: REFERENCE,
        status: "PAID",
      },
    });
    return { block, order };
  });

  console.log(`wall block: ${block.id} at ${block.x},${block.y} ${W}x${H} = ${(W * H) / 100} bricks, image ${imageUrl}`);
  console.log(`order: ${order.id} PAID $${AMOUNT_MINOR / 100} ${order.currency} (${order.provider})`);
  console.log(`live: ${SITE}/walloffame`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
