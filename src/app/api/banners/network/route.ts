import { NextResponse } from "next/server";
import { activeBanners } from "@/lib/banners";
import { AD_PLACEMENTS, formatAdPrice } from "@/lib/ads";
import { siteUrl } from "@/lib/format";

export const dynamic = "force-dynamic";

const HEADERS = {
  "access-control-allow-origin": "*",
  "cache-control": "public, s-maxage=300, stale-while-revalidate=3600",
};

/**
 * Live Small banners for Anil's other websites. The Small banner booking
 * includes these sites, so a satellite shows a few of these in its footer and
 * rotates them in the browser. Clicks go through our click counter and views
 * are posted back to /api/banners/impression.
 */
export async function GET() {
  const base = siteUrl();
  const placement = AD_PLACEMENTS.MOBILE;
  const banners = (await activeBanners("MOBILE", 50)).flatMap((banner) => {
    let image: URL;
    try {
      image = new URL(banner.imageUrl, base);
    } catch {
      return [];
    }
    if (image.protocol !== "https:" && image.protocol !== "http:") return [];
    return [
      {
        id: banner.id,
        title: banner.title,
        image: image.toString(),
        click: `${base}/api/banners/${banner.id}/click`,
      },
    ];
  });

  return NextResponse.json(
    {
      size: placement.size,
      price: `${formatAdPrice(placement, "USD")}/mo`,
      bookUrl: `${base}/advertise?slot=MOBILE#book`,
      impressionUrl: `${base}/api/banners/impression`,
      banners,
    },
    { headers: HEADERS },
  );
}
