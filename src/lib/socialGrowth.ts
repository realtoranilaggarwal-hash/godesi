/** Social media growth services sold as add-ons; ordered by Venmo, Zelle or phone, not by card. */

export type SocialPackage = { qty: number; priceUsd: number };

export type SocialService = {
  slug: string;
  platform: "Instagram" | "Facebook" | "TikTok" | "YouTube";
  icon: string;
  label: string;
  unit: string;
  blurb: string;
  packages: SocialPackage[];
};

export const SOCIAL_ORDER_PHONE = "732-877-8585";
export const SOCIAL_ORDER_PHONE_HREF = "tel:+17328778585";

function packages(rows: [number, number][]): SocialPackage[] {
  return rows.map(([qty, priceUsd]) => ({ qty, priceUsd }));
}

export const SOCIAL_SERVICES: SocialService[] = [
  {
    slug: "instagram-followers",
    platform: "Instagram",
    icon: "📸",
    label: "Instagram followers",
    unit: "followers",
    blurb: "More followers make a new or small account look established, so visitors trust it and follow too.",
    packages: packages([[50, 20.99], [200, 50.99], [400, 80.99], [800, 140.99], [1500, 250.99], [3500, 500.99]]),
  },
  {
    slug: "instagram-likes",
    platform: "Instagram",
    icon: "📸",
    label: "Instagram likes",
    unit: "likes",
    blurb: "Extra likes on a post push it toward Explore and show new visitors your content is worth a look.",
    packages: packages([[650, 20.99], [1950, 50.99], [3250, 80.99], [6500, 140.99], [16250, 250.99], [32500, 500.99]]),
  },
  {
    slug: "instagram-reels-views",
    platform: "Instagram",
    icon: "📸",
    label: "Instagram Reels views",
    unit: "views",
    blurb: "Give a new Reel a strong start so more people stop and watch it.",
    packages: packages([[3500, 20.99], [12000, 50.99], [25000, 80.99], [50000, 140.99], [100000, 250.99], [300000, 500.99]]),
  },
  {
    slug: "facebook-page-followers",
    platform: "Facebook",
    icon: "👍",
    label: "Facebook page followers",
    unit: "followers",
    blurb: "Grow your business page so it looks active and trusted when customers check you out.",
    packages: packages([[100, 9.99], [200, 19.99], [500, 47.99], [1000, 92.99], [2000, 178.99], [3000, 261.99], [5000, 420.99], [10000, 792.99]]),
  },
  {
    slug: "facebook-reactions",
    platform: "Facebook",
    icon: "👍",
    label: "Facebook post reactions",
    unit: "reactions",
    blurb: "Likes, loves and wows on a post so Facebook shows it to more people.",
    packages: packages([[100, 14.99], [200, 28.99], [500, 70.99], [1000, 138.99], [2000, 268.99], [3000, 393.99], [5000, 633.99], [10000, 1192.99]]),
  },
  {
    slug: "facebook-post-shares",
    platform: "Facebook",
    icon: "👍",
    label: "Facebook post shares",
    unit: "shares",
    blurb: "Shares carry your post, offer or event into more feeds.",
    packages: packages([[50, 9.99], [100, 19.99], [200, 37.99], [500, 92.99], [1000, 178.99], [2000, 348.99], [3000, 504.99], [5000, 792.99]]),
  },
  {
    slug: "tiktok-followers",
    platform: "TikTok",
    icon: "🎵",
    label: "TikTok followers",
    unit: "followers",
    blurb: "A bigger follower count helps your profile look popular and win follow-backs.",
    packages: packages([[100, 19.99], [500, 79.99], [1000, 149.99], [2000, 279.99], [5000, 629.99], [10000, 1169.99], [20000, 2139.99], [30000, 2909.99]]),
  },
  {
    slug: "tiktok-likes",
    platform: "TikTok",
    icon: "🎵",
    label: "TikTok likes",
    unit: "likes",
    blurb: "Likes tell TikTok your video is worth showing on more For You pages.",
    packages: packages([[300, 14.99], [500, 22.99], [1000, 42.99], [2000, 79.99], [3000, 111.99], [5000, 173.99], [10000, 321.99], [20000, 594.99]]),
  },
  {
    slug: "tiktok-views",
    platform: "TikTok",
    icon: "🎵",
    label: "TikTok views",
    unit: "views",
    blurb: "A healthy view count makes people more likely to watch to the end.",
    packages: packages([[5000, 20.99], [20000, 50.99], [35000, 80.99], [70000, 140.99], [160000, 250.99], [400000, 500.99]]),
  },
  {
    slug: "tiktok-shares",
    platform: "TikTok",
    icon: "🎵",
    label: "TikTok shares",
    unit: "shares",
    blurb: "Shares spread a video beyond your own followers.",
    packages: packages([[250, 14.99], [500, 28.99], [1000, 53.99], [2000, 101.99], [3000, 143.99], [5000, 223.99], [10000, 417.99], [20000, 774.99]]),
  },
  {
    slug: "youtube-subscribers",
    platform: "YouTube",
    icon: "▶️",
    label: "YouTube subscribers",
    unit: "subscribers",
    blurb: "More subscribers build trust in your channel and help it get recommended.",
    packages: packages([[100, 29.99], [300, 87.99], [500, 142.99], [1000, 278.99], [2000, 538.99], [3000, 789.99], [5000, 1270.99], [10000, 2392.99]]),
  },
  {
    slug: "youtube-likes",
    platform: "YouTube",
    icon: "▶️",
    label: "YouTube likes",
    unit: "likes",
    blurb: "Likes are social proof that a video is good, so new viewers keep watching.",
    packages: packages([[300, 19.99], [500, 32.99], [1000, 63.99], [2000, 123.99], [3000, 179.99], [5000, 291.99], [10000, 563.99], [20000, 1061.99]]),
  },
];

export const SOCIAL_PLATFORMS = Array.from(new Set(SOCIAL_SERVICES.map((s) => s.platform)));

export function socialService(slug: string) {
  return SOCIAL_SERVICES.find((service) => service.slug === slug) ?? null;
}

export function socialPackage(slug: string, qty: number) {
  return socialService(slug)?.packages.find((pkg) => pkg.qty === qty) ?? null;
}

export const formatSocialUsd = (amount: number) =>
  `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatSocialQty = (qty: number) => qty.toLocaleString("en-US");
