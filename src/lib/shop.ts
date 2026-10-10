/**
 * Curated shelves for /shop. Each shelf is a search on the store rather than
 * copied product listings, so prices and photos always come from the store.
 */
export const SHOP_SHELVES = [
  {
    key: "diwali",
    icon: "🪔",
    title: "Diwali & festival decor",
    blurb: "Diyas, torans, string lights, rangoli and gift boxes.",
    query: "diwali decorations diya toran",
  },
  {
    key: "puja",
    icon: "🕉️",
    title: "Puja essentials",
    blurb: "Thali sets, agarbatti, kalash, idols and havan samagri.",
    query: "puja thali set agarbatti",
  },
  {
    key: "kitchen",
    icon: "🍛",
    title: "Indian kitchen",
    blurb: "Pressure cookers, tawa, masala dabba, idli and dosa makers.",
    query: "indian kitchen pressure cooker masala dabba tawa",
  },
  {
    key: "ethnic",
    icon: "🥻",
    title: "Ethnic wear",
    blurb: "Sarees, kurtas, lehengas and sherwanis for every function.",
    query: "indian ethnic wear saree kurta lehenga",
  },
  {
    key: "wedding",
    icon: "💍",
    title: "Wedding & shaadi",
    blurb: "Mehndi favours, haldi decor, return gifts and jewellery boxes.",
    query: "indian wedding mehndi haldi decor favors",
  },
  {
    key: "holi",
    icon: "🎨",
    title: "Holi & Navratri",
    blurb: "Organic gulal, dandiya sticks, chaniya choli and garba wear.",
    query: "holi colors dandiya sticks navratri",
  },
  {
    key: "music",
    icon: "🎤",
    title: "Karaoke & music",
    blurb: "Karaoke mics, party speakers, harmonium and tabla.",
    query: "karaoke microphone party speaker harmonium",
  },
  {
    key: "books",
    icon: "📚",
    title: "Kids, books & languages",
    blurb: "Hindi, Gujarati and Tamil learning books, Amar Chitra Katha.",
    query: "hindi learning books kids amar chitra katha",
  },
] as const;

export type ShopShelf = (typeof SHOP_SHELVES)[number];

/** Store IDs are public tracking IDs, set in the environment once each programme approves GoDesi. */
export function shopConfig() {
  return {
    amazonTag: process.env.AMAZON_ASSOCIATE_TAG?.trim() || null,
    ebayCampaignId: process.env.EBAY_CAMPAIGN_ID?.trim() || null,
    quicklyUrl: process.env.QUICKLLY_REFERRAL_URL?.trim() || null,
  };
}

export function amazonSearchUrl(query: string, tag: string) {
  const url = new URL("https://www.amazon.com/s");
  url.searchParams.set("k", query);
  url.searchParams.set("tag", tag);
  return url.toString();
}

/** eBay Partner Network's standard US tracking parameters on a search page. */
export function ebaySearchUrl(query: string, campaignId: string) {
  const url = new URL("https://www.ebay.com/sch/i.html");
  url.searchParams.set("_nkw", query);
  url.searchParams.set("mkcid", "1");
  url.searchParams.set("mkrid", "711-53200-19255-0");
  url.searchParams.set("siteid", "0");
  url.searchParams.set("campid", campaignId);
  url.searchParams.set("toolid", "10001");
  url.searchParams.set("mkevt", "1");
  return url.toString();
}
