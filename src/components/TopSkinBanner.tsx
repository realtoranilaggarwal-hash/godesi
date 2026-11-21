import { activeBanners } from "@/lib/banners";
import { AD_PLACEMENTS } from "@/lib/ads";
import { BannerLink, BookThisSpot } from "@/components/Banners";
import { NYE_COUNTDOWN_TO_MS } from "@/lib/topSkin";
import { TopSkinHouse, type HouseSkin } from "@/components/TopSkinHouse";

const SKIN = AD_PLACEMENTS.SKIN;
const SELL_LABEL = `top strip on every page — ${SKIN.size.width} × ${SKIN.size.height}`;

/**
 * The full-width strip under the site header. A booked SKIN banner runs here;
 * unsold, GoDesi's own house creatives take turns. Either way the spot stays for
 * sale.
 */
export async function TopSkinBanner() {
  const [banner] = await activeBanners("SKIN", 1);

  if (banner) {
    return (
      <div className="mx-auto w-full max-w-screen-2xl px-4 pt-3">
        <BannerLink
          banner={banner}
          width={SKIN.size.width}
          height={SKIN.size.height}
          className="mx-auto max-w-[970px]"
          sellSlot="SKIN"
          sellLabel={SELL_LABEL}
        />
      </div>
    );
  }

  // The NYE promo retires once the ball has dropped.
  const house: HouseSkin[] =
    Date.now() < NYE_COUNTDOWN_TO_MS ? ["nye", "suhag"] : ["suhag"];
  const pick = house[Math.floor(Math.random() * house.length)];

  return (
    <div className="mx-auto w-full max-w-screen-2xl space-y-1 px-4 pt-3">
      <TopSkinHouse pick={pick} />
      <BookThisSpot slot="SKIN" label={SELL_LABEL} />
    </div>
  );
}
