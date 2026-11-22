import { PrismaClient } from "@prisma/client";

/**
 * Swaps the photo-only house banners for versions that say what they are
 * (like the Oak Tree Road one), and adds the owner's Temu Black Friday offers:
 * store-offer cards on /deals and /shop plus two banners in the small-banner
 * rotation. Temu's wording, codes and disclaimer are used exactly as given.
 * Re-runnable.
 *
 *   npx tsx scripts/add-temu-and-banner-captions.ts
 */
const db = new PrismaClient();

const CAPTIONED: Record<string, string> = {
  cmvm1hfgg00006p8k2y4bfe09: "/images/ads/info-games.png",
  cmvm1hfkn00016p8kcdwzpsag: "/images/ads/info-astrology.png",
  cmvm1hfng00026p8kr4y06ah6: "/images/ads/info-food.png",
  cmvm1hfq900036p8k0at5ej76: "/images/ads/info-wedding.png",
  cmvmkyxmy0000vubdwcdyp7iy: "/images/ads/info-rishta.png",
  cmvmkyxyt0001vubdotxiuuov: "/images/ads/info-festivals.png",
  cmvmkyy1r0002vubdngk1rs8z: "/images/ads/info-wedding-services.png",
  cmvmkyy4o0003vubdvx2mpesd: "/images/ads/info-games.png",
};

/** Temu's Black Friday campaign ends with Cyber Monday (Nov 30, 2026 ET). */
const ENDS = new Date("2026-12-01T05:00:00Z");
const GIFTS_LINK = "https://temu.to/k/prbu41omq9p";
const WELCOME_LINK = "https://temu.to/k/us2rOByobnO4K79";
const GIFTS_DISCLAIMER =
  "Select gift(s) on the promotion page with qualifying orders. The purchase required is determined by the gift(s)' value. T&Cs apply.";

const OFFERS = [
  {
    externalId: "temu-40-off",
    title: "40% OFF for new Temu app users",
    description:
      "Search code afc75039 for 40% OFF in the TEMU app. Free returns within 90 days. Only for app users with qualifying orders. T&Cs apply.",
    code: "afc75039",
    clickUrl: WELCOME_LINK,
  },
  {
    externalId: "temu-coupon-bundle",
    title: "$200 coupon bundle for new Temu users",
    description:
      "Open the link to claim your $200 coupon bundle in the TEMU app. Only for app users with qualifying orders. T&Cs apply.",
    code: null,
    clickUrl: WELCOME_LINK,
  },
  {
    externalId: "temu-gifts-0",
    title: "Gifts at $0 on Temu",
    description: `Search code alc303030 for Gifts at $0 in TEMU app. ${GIFTS_DISCLAIMER}`,
    code: "alc303030",
    clickUrl: GIFTS_LINK,
  },
];

const BANNERS = [
  {
    title:
      "Temu Black Friday — search code afc75039 for 40% OFF in the TEMU app",
    imageUrl: "/images/ads/temu-40-off.png",
    linkUrl: WELCOME_LINK,
  },
  {
    title: `Temu Black Friday — search code alc303030 for Gifts at $0 in TEMU app. ${GIFTS_DISCLAIMER}`,
    imageUrl: "/images/ads/temu-gifts-0.png",
    linkUrl: GIFTS_LINK,
  },
];

async function main() {
  for (const [id, imageUrl] of Object.entries(CAPTIONED)) {
    const { count } = await db.banner.updateMany({
      where: { id },
      data: { imageUrl },
    });
    console.log(`${count ? "captioned" : "missing"} ${id}`);
  }

  for (const offer of OFFERS) {
    const data = {
      ...offer,
      advertiserId: "temu",
      advertiserName: "Temu",
      promotionType: offer.code ? "coupon" : "sale",
      category: "Shopping",
      endsAt: ENDS,
      active: true,
      syncedAt: new Date(),
    };
    await db.storeOffer.upsert({
      where: {
        source_externalId: { source: "TEMU", externalId: offer.externalId },
      },
      create: { source: "TEMU", ...data },
      update: data,
    });
    console.log(`offer ${offer.externalId}`);
  }

  // Wall slot: rotates in every small-banner stack without using up the
  // ten sellable 320x100 spots.
  for (const banner of BANNERS) {
    const existing = await db.banner.findFirst({
      where: { imageUrl: banner.imageUrl },
      select: { id: true },
    });
    if (existing) {
      await db.banner.update({
        where: { id: existing.id },
        data: { ...banner, endsAt: ENDS, active: true, status: "ACTIVE" },
      });
      console.log(`banner updated ${banner.imageUrl}`);
      continue;
    }
    const last = await db.banner.aggregate({
      where: { slot: "WALL" },
      _max: { position: true },
    });
    await db.banner.create({
      data: {
        ...banner,
        slot: "WALL",
        position: (last._max.position ?? 0) + 1,
        endsAt: ENDS,
      },
    });
    console.log(`banner added ${banner.imageUrl}`);
  }
}

main().finally(() => db.$disconnect());
