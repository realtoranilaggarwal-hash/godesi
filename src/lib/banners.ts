import { db } from "@/lib/db";

/** Sidebar rail holds 10 fixed 300x250 slots; the header holds 1. */
export const SIDEBAR_SLOTS = 10;
export const HEADER_SLOTS = 1;
export const SIDEBAR_SIZE = { width: 300, height: 250 };
export const HEADER_SIZE = { width: 970, height: 90 };

export async function activeBanners(slot: "SIDEBAR" | "HEADER", limit?: number) {
  return db.banner.findMany({
    where: { slot, active: true },
    orderBy: { position: "asc" },
    take: limit ?? (slot === "SIDEBAR" ? SIDEBAR_SLOTS : HEADER_SLOTS),
    select: { id: true, title: true, imageUrl: true, linkUrl: true, position: true },
  });
}
