/** GoDesi's own portrait side banners (the 10-panel sheet), each linking to its section. */
export type SidePromo = { image: string; href: string; title: string; width: number; height: number };

const promo = (n: number, slug: string, href: string, title: string, width: number, height: number): SidePromo => ({
  image: `/banners/side/side-${String(n).padStart(2, "0")}-${slug}.jpg`,
  href: `${href}${href.includes("?") ? "&" : "?"}src=side-${slug}`,
  title,
  width,
  height,
});

export const SIDE_PROMOS: SidePromo[] = [
  promo(1, "grow-business", "/add-business", "Grow your business the Desi way — free business listing", 642, 1020),
  promo(2, "find-everything", "/categories", "Find everything Desi, all in one place", 568, 1020),
  promo(3, "real-leads", "/leads", "Get real leads for your business", 594, 1020),
  promo(4, "connect", "/connect", "Connect. Collaborate. Grow together.", 580, 1020),
  promo(5, "events", "/events", "Find and promote Desi events", 580, 1020),
  promo(6, "trusted", "/search", "Looking for a trusted Desi business or service?", 602, 1022),
  promo(7, "premium", "/upgrade", "Become a GoDesi Premium member", 576, 1022),
  promo(8, "your-page", "/claim", "Your business, your brand, your page", 614, 1022),
  promo(9, "jobs", "/jobs", "Desi jobs. Desi talent. Desi opportunities.", 546, 1022),
  promo(10, "community-hub", "/chatter", "Make GoDesi your community hub", 558, 1022),
];

/** A different side banner every hour; `offset` lets two spots on one page differ. */
export function currentSidePromo(offset = 0): SidePromo {
  const hour = Math.floor(Date.now() / 3_600_000);
  return SIDE_PROMOS[(hour + offset) % SIDE_PROMOS.length];
}
