import type { BannerSlot } from "@prisma/client";
import { db } from "@/lib/db";
import { AD_PLACEMENTS } from "@/lib/ads";

/** Sidebar rail holds 10 fixed 300x250 slots; the header holds 1; 4 skyscrapers. */
export const SIDEBAR_SLOTS = AD_PLACEMENTS.SIDEBAR.slots;
export const HEADER_SLOTS = AD_PLACEMENTS.HEADER.slots;
export const SKYSCRAPER_SLOTS = AD_PLACEMENTS.SKYSCRAPER.slots;
export const SIDEBAR_SIZE = AD_PLACEMENTS.SIDEBAR.size;
export const HERO_SIZE = AD_PLACEMENTS.HERO.size;
export const HEADER_SIZE = AD_PLACEMENTS.HEADER.size;
export const SKYSCRAPER_SIZE = AD_PLACEMENTS.SKYSCRAPER.size;

export function slotCapacity(slot: BannerSlot) {
  return AD_PLACEMENTS[slot].slots;
}

type RotatingBanner = {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  impressions: number;
  impressionCap: number | null;
};

/**
 * Picks which of the eligible creatives to show. Banners shown least so far get
 * the heaviest weight, and an impression pack is weighted by the views it still
 * has owing, so everyone sharing a slot gets a turn instead of one banner
 * winning every page view.
 */
function rotate(banners: RotatingBanner[], take: number) {
  const mostShown = banners.reduce(
    (max, banner) => Math.max(max, banner.impressions),
    0,
  );

  const weighted = banners.map((banner) => ({
    banner,
    // +1 keeps a brand new banner (0 impressions) from being the only pick.
    weight:
      (mostShown - banner.impressions + 1) *
      (banner.impressionCap === null
        ? 1
        : Math.max(1, banner.impressionCap - banner.impressions)),
  }));

  const picked: RotatingBanner[] = [];
  while (picked.length < take && weighted.length) {
    const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
    let target = Math.random() * total;
    let index = weighted.length - 1;
    for (let i = 0; i < weighted.length; i += 1) {
      target -= weighted[i].weight;
      if (target <= 0) {
        index = i;
        break;
      }
    }
    picked.push(weighted[index].banner);
    weighted.splice(index, 1);
  }
  return picked;
}

/**
 * Live creatives for a slot: approved, not paused, inside their booked window and
 * with impressions left on an impression pack. More advertisers than there are
 * slots is fine — the extras rotate in on later page views.
 */
export async function activeBanners(slot: BannerSlot, limit?: number) {
  const now = new Date();

  const eligible = await db.banner.findMany({
    where: {
      slot,
      active: true,
      status: "ACTIVE",
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
    orderBy: { position: "asc" },
    select: {
      id: true,
      title: true,
      imageUrl: true,
      linkUrl: true,
      impressions: true,
      impressionCap: true,
    },
  });

  const withQuota = eligible.filter(
    (banner) =>
      banner.impressionCap === null ||
      banner.impressions < banner.impressionCap,
  );

  return rotate(withQuota, limit ?? slotCapacity(slot));
}

/** How many advertisers currently share a slot, used to show unsold inventory. */
export async function slotSoldCount(slot: BannerSlot) {
  const now = new Date();

  return db.banner.count({
    where: {
      slot,
      active: true,
      status: "ACTIVE",
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
  });
}

/**
 * Counts one view and retires an impression-pack banner as soon as its quota is
 * used up, so a sold pack stops serving without an admin step.
 */
export async function countImpression(bannerId: string) {
  const now = new Date();

  // A single conditional statement, so parallel page views can never push a
  // booking past the quota it paid for.
  const counted = await db.$executeRaw`
    UPDATE "Banner"
    SET impressions = impressions + 1
    WHERE id = ${bannerId}
      AND active = true
      AND status = 'ACTIVE'
      AND ("startsAt" IS NULL OR "startsAt" <= ${now})
      AND ("endsAt" IS NULL OR "endsAt" >= ${now})
      AND ("impressionCap" IS NULL OR impressions < "impressionCap")
  `;

  if (!counted) return false;

  // The view that consumed the last impression also retires the booking.
  await db.$executeRaw`
    UPDATE "Banner"
    SET status = 'EXPIRED', active = false
    WHERE id = ${bannerId}
      AND status = 'ACTIVE'
      AND "impressionCap" IS NOT NULL
      AND impressions >= "impressionCap"
  `;

  return true;
}
