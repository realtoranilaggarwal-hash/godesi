import type { BannerSlot } from "@prisma/client";
import { db } from "@/lib/db";
import { AD_PLACEMENTS } from "@/lib/ads";

/** Sidebar rail holds 10 fixed 300x250 slots; the header holds 1; 4 skyscrapers. */
export const SIDEBAR_SLOTS = AD_PLACEMENTS.SIDEBAR.slots;
export const HEADER_SLOTS = AD_PLACEMENTS.HEADER.slots;
export const SKYSCRAPER_SLOTS = AD_PLACEMENTS.SKYSCRAPER.slots;
export const SIDEBAR_SIZE = AD_PLACEMENTS.SIDEBAR.size;
export const HEADER_SIZE = AD_PLACEMENTS.HEADER.size;
export const SKYSCRAPER_SIZE = AD_PLACEMENTS.SKYSCRAPER.size;

export function slotCapacity(slot: BannerSlot) {
  return AD_PLACEMENTS[slot].slots;
}

/**
 * Live creatives for a slot: approved, not paused and inside their booked window.
 * Bookings without dates run until an admin pauses them.
 */
export async function activeBanners(slot: BannerSlot, limit?: number) {
  const now = new Date();

  return db.banner.findMany({
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
    take: limit ?? slotCapacity(slot),
    select: { id: true, title: true, imageUrl: true, linkUrl: true, position: true },
  });
}
