export type MarketingProduct = {
  id: string;
  name: string;
  blurb: string;
  image: string;
  priceUsd: number;
  category: MarketingCategory;
  /** Printed size, shown on the card. */
  size?: string;
};

/** Shop sections, in display order. Add a category here, then tag products with its id. */
export const MARKETING_CATEGORIES = [
  { id: "flags", label: "Flags & banners" },
  { id: "print", label: "Stickers & print" },
  { id: "reviews", label: "Reviews & social" },
  { id: "gifts", label: "Promo gifts" },
  { id: "apparel", label: "Apparel" },
] as const;

export type MarketingCategory = (typeof MARKETING_CATEGORIES)[number]["id"];

/** GoDesi Marketing Shop: custom-printed items we design with the client's logo and GoDesi QR, then ship to them. */
export const MARKETING_PRODUCTS: MarketingProduct[] = [
  { id: "triangle-flags", name: "Custom triangle flags", blurb: "Pennant flags with your logo for doors, stores, weddings and festivals.", image: "/images/shop/triangle-flags.jpg", priceUsd: 10.24, category: "flags" },
  { id: "car-sticker", name: "Large custom car sticker", blurb: "Waterproof, removable sticker with your logo, phone and QR code.", image: "/images/shop/car-sticker.jpg", priceUsd: 11.55, category: "print" },
  { id: "wall-banner", name: "Custom photo / text wall banner", blurb: "Entrance banner or photo backdrop for events, openings and parties.", image: "/images/shop/wall-banner.jpg", priceUsd: 6.11, category: "flags" },
  { id: "vertical-flags", name: "Custom vertical door banner flag", blurb: "Tall polyester flag with your logo, photo and text, for indoor or outdoor events. Price includes design.", image: "/images/shop/vertical-flags.jpg", priceUsd: 50, category: "flags", size: "35.4 × 70.8 in" },
  { id: "a5-flyers", name: "50 custom double-sided flyers", blurb: "50 sheets printed on both sides for your offers and events. Price includes design and shipping.", image: "/images/shop/a5-flyers.jpg", priceUsd: 99, category: "print", size: "5.5 × 8.27 in" },
  { id: "qr-keychains", name: "45 acrylic logo keychains with QR code", blurb: "Hand-out keychains with your logo and a QR code to your GoDesi page.", image: "/images/shop/qr-keychains.jpg", priceUsd: 21.32, category: "gifts" },
  { id: "printed-pens", name: "200 custom printed pens", blurb: "200 ballpoint pens printed with your name, phone and logo.", image: "/images/shop/printed-pens.jpg", priceUsd: 100, category: "gifts" },
  { id: "bamboo-pens", name: "50 engraved bamboo pens", blurb: "Engraved bamboo pens for client gifts, guest books and weddings.", image: "/images/shop/bamboo-pens.jpg", priceUsd: 99.99, category: "gifts" },
  { id: "nfc-review-stand", name: "NFC tap + QR review stand", blurb: "Counter stand: customers tap their phone or scan to review you or follow your socials.", image: "/images/shop/nfc-review-stand.jpg", priceUsd: 23.39, category: "reviews" },
  { id: "logo-beanie", name: "Custom text beanie", blurb: "Warm winter beanie printed with your business name or logo.", image: "/images/shop/logo-beanie.jpg", priceUsd: 13.99, category: "apparel" },
];

export const MARKETING_SHOP_ORDER_FOR = {
  shop: "Just these items",
  classified: "My classified ad",
  website: "My website order",
  premium: "My Premium package",
} as const;

export type MarketingShopOrderFor = keyof typeof MARKETING_SHOP_ORDER_FOR;

export function findMarketingProduct(id: string) {
  return MARKETING_PRODUCTS.find((p) => p.id === id);
}

export function marketingShopFromUsd() {
  return Math.min(...MARKETING_PRODUCTS.map((p) => p.priceUsd));
}

export function usd(amount: number) {
  return `$${amount.toFixed(2)}`;
}
