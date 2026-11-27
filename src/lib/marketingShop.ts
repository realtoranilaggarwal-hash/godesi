export type MarketingProduct = {
  id: string;
  name: string;
  blurb: string;
  image: string;
  priceUsd: number;
  category: MarketingCategory;
  /** Printed size, shown on the card. */
  size?: string;
  /** A finished design we made, shown as "we'll design one like this". */
  example?: string;
};

/** Shop sections, in display order. Add a category here, then tag products with its id. */
export const MARKETING_CATEGORIES = [
  { id: "flags", label: "Flags & banners" },
  { id: "print", label: "Stickers & print" },
  { id: "reviews", label: "Reviews & social" },
  { id: "gifts", label: "Promo gifts" },
] as const;

export type MarketingCategory = (typeof MARKETING_CATEGORIES)[number]["id"];

/** GoDesi Marketing Shop: custom-printed items we design with the client's logo and GoDesi QR, then ship to them. */
export const MARKETING_PRODUCTS: MarketingProduct[] = [
  { id: "triangle-flags", name: "Custom triangle flags", blurb: "Pennant flag with your photo, logo, phone and GoDesi QR code for doors, stores, weddings and festivals. We design one like the example.", image: "/images/shop/triangle-flags.jpg", priceUsd: 10.24, category: "flags", size: "11.81 × 15.75 in", example: "/marketing-shop/example/triangle-flags" },
  { id: "car-sticker", name: "Large custom car sticker", blurb: "Waterproof, removable sticker with your logo, phone and QR code.", image: "/images/shop/car-sticker.jpg", priceUsd: 11.55, category: "print", size: "7.87 × 7.87 in", example: "/marketing-shop/example/car-sticker" },
  { id: "wall-banner", name: "Custom photo / text wall banner", blurb: "Big entrance banner or photo backdrop with your photo, text and QR code for events, openings and parties. Price includes design. Stand not included.", image: "/images/shop/wall-banner.jpg", priceUsd: 49.99, category: "flags", size: "70.87 × 90.55 in", example: "/marketing-shop/example/wall-banner" },
  { id: "rainbow-backdrop", name: "Rainbow photo backdrop with your name", blurb: "Colourful polyester backdrop printed with your photo and name text for weddings, birthdays, parties and indoor decor. Easy to hang. Price includes design and shipping. Stand not included.", image: "/images/shop/rainbow-backdrop.jpg", priceUsd: 50, category: "flags", size: "59 × 51 in", example: "/marketing-shop/example/rainbow-backdrop" },
  { id: "rollup-banner-stand", name: "Retractable roll-up banner stand", blurb: "Heavy-duty roll-up stand with your custom banner for trade shows, stores, events and roadshows. Includes the base stand and printed graphics. Price includes design and shipping.", image: "/images/shop/rollup-banner-stand.jpg", priceUsd: 79, category: "flags", size: "31.5 × 78.74 in", example: "/marketing-shop/example/rollup-banner-stand" },
  { id: "vertical-flags", name: "Custom vertical door banner flag", blurb: "Tall polyester flag with your logo, photo and text, for indoor or outdoor events. Price includes design.", image: "/images/shop/vertical-flags.jpg", priceUsd: 50, category: "flags", size: "35.4 × 70.8 in", example: "/marketing-shop/example/vertical-flags" },
  { id: "qr-stickers", name: "1000 round QR code stickers", blurb: "Full-colour stickers we design with your text, with your QR code to your GoDesi page in the middle. For bags, boxes, envelopes and handouts.", image: "/images/shop/qr-stickers.jpg", priceUsd: 50, category: "print", size: "1.97 in round", example: "/marketing-shop/example/qr-stickers" },
  { id: "business-cards", name: "1000 double-sided business cards", blurb: "Full-colour cards printed on both sides with your photo, contact details and a QR code to your GoDesi page. We design them like the example. Price includes design and shipping.", image: "/images/shop/business-cards.jpg", priceUsd: 50, category: "print", size: "3.5 × 2 in", example: "/images/shop/business-cards-example.jpg" },
  { id: "a5-flyers", name: "50 custom double-sided flyers", blurb: "50 sheets printed on both sides for your offers and events. Price includes design and shipping.", image: "/images/shop/a5-flyers.jpg", priceUsd: 99, category: "print", size: "5.5 × 8.27 in", example: "/marketing-shop/example/a5-flyers" },
  { id: "qr-keychains", name: "45 acrylic logo keychains with QR code", blurb: "Hand-out keychains with your logo and a QR code to your GoDesi page.", image: "/images/shop/qr-keychains.jpg", priceUsd: 21.32, category: "gifts", example: "/marketing-shop/example/qr-keychains" },
  { id: "printed-pens", name: "200 custom printed pens", blurb: "200 ballpoint pens printed with your name, phone and logo.", image: "/images/shop/printed-pens.jpg", priceUsd: 100, category: "gifts", example: "/marketing-shop/example/printed-pens" },
  { id: "bamboo-pens", name: "50 engraved bamboo pens", blurb: "Engraved bamboo pens for client gifts, guest books and weddings.", image: "/images/shop/bamboo-pens.jpg", priceUsd: 99.99, category: "gifts", example: "/marketing-shop/example/bamboo-pens" },
  { id: "nfc-review-stand", name: "NFC tap + QR review stand", blurb: "Counter stand: customers tap their phone or scan to review you or follow your socials.", image: "/images/shop/nfc-review-stand.jpg", priceUsd: 23.39, category: "reviews", example: "/marketing-shop/example/nfc-review-stand" },
];

export const MARKETING_SHOP_ORDER_FOR = {
  shop: "Just these items",
  classified: "My classified ad",
  website: "My website order",
  premium: "My Premium package",
} as const;

export type MarketingShopOrderFor = keyof typeof MARKETING_SHOP_ORDER_FOR;

/** No longer sold, but kept so carts paid before removal still decode in order emails. */
const RETIRED_MARKETING_PRODUCTS: MarketingProduct[] = [
  { id: "logo-beanie", name: "Custom text beanie", blurb: "Warm winter beanie printed with your business name or logo.", image: "/images/shop/logo-beanie.jpg", priceUsd: 13.99, category: "gifts" },
];

export function findMarketingProduct(id: string) {
  return [...MARKETING_PRODUCTS, ...RETIRED_MARKETING_PRODUCTS].find((p) => p.id === id);
}

export function marketingShopFromUsd() {
  return Math.min(...MARKETING_PRODUCTS.map((p) => p.priceUsd));
}

export function usd(amount: number) {
  return `$${amount.toFixed(2)}`;
}
