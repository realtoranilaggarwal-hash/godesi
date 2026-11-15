import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { put } from "@vercel/blob";
import bcrypt from "bcryptjs";
import { canonicalEmail } from "../src/lib/signupGuard";
import { ensureUsername } from "../src/lib/profiles";

/**
 * Books Master Bedina's $500 paid spot on the Wall of Fame: 50 desi bricks
 * (100x50 px) in the top-most free rectangle, live immediately, plus a PAID
 * manual AdOrder so the $500 is on record. Makes sure his astrologer card
 * exists, is owned by his account (created with an unusable password if
 * missing) and is featured for a year. Re-runnable: an existing block is kept.
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
const EMAIL = "sanhatiusa@gmail.com";
const PHONE = "+16463827477";
const FEATURED_RANK = 2;

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
      category: "Astrologers",
      categorySlug: "religious-services",
      subcategorySlug: "religious-services-astrologers",
      city: "New York",
      state: "NY",
      country: "USA",
      description: cardDescription,
      phone: PHONE,
      publicEmail: EMAIL,
      logoUrl: `/${IMAGE_FILE.replace(/^public\//, "")}`,
      status: "APPROVED",
    },
  });
}

/** His login-less account: an unusable password until he resets it himself. */
async function ownerAccount() {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: EMAIL }, { emailCanonical: canonicalEmail(EMAIL) }] },
  });
  if (existing) return existing;
  const user = await prisma.user.create({
    data: {
      name: "Master Bedina",
      email: EMAIL,
      emailCanonical: canonicalEmail(EMAIL),
      role: "BUSINESS",
      passwordHash: await bcrypt.hash(randomBytes(32).toString("hex"), 10),
      offerPhone: PHONE,
    },
  });
  await ensureUsername(user.id);
  return user;
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
  let card = await astrologerCard();
  const owner = await ownerAccount();
  if (card.ownerId && card.ownerId !== owner.id) {
    throw new Error(`${SLUG} is owned by another account (${card.ownerId})`);
  }

  // Paid spot: claimed by him, approved, contact filled in, featured for a year.
  // An existing logo (his own upload) is kept.
  const featuredUntil = new Date();
  featuredUntil.setFullYear(featuredUntil.getFullYear() + 1);
  card = await prisma.business.update({
    where: { id: card.id },
    data: {
      ownerId: owner.id,
      status: "APPROVED",
      categorySlug: "religious-services",
      subcategorySlug: "religious-services-astrologers",
      phone: card.phone ?? PHONE,
      publicEmail: card.publicEmail ?? EMAIL,
      logoUrl: card.logoUrl ?? `/${IMAGE_FILE.replace(/^public\//, "")}`,
      featured: true,
      featuredRank: FEATURED_RANK,
      featuredUntil:
        card.featuredUntil && card.featuredUntil > featuredUntil ? card.featuredUntil : featuredUntil,
    },
  });
  console.log(
    `card: ${card.id} -> ${SITE}/business/${card.slug} (owner ${owner.id}, featured #${card.featuredRank} until ${card.featuredUntil?.toISOString()})`,
  );

  const advertiserId = owner.id;
  const orderUserId = owner.id;

  const existing = await prisma.adOrder.findUnique({
    where: { reference: REFERENCE },
    include: { wallBlock: true },
  });
  if (existing?.wallBlock) {
    let b = existing.wallBlock;
    if (b.advertiserId !== advertiserId || b.status !== "ACTIVE") {
      b = await prisma.wallBlock.update({
        where: { id: b.id },
        data: { advertiserId, status: "ACTIVE" },
      });
    }
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
