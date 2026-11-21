import type { BannerSlot } from "@prisma/client";
import { activeBanners } from "@/lib/banners";
import { BannerImpression } from "@/components/BannerImpression";
import { BookThisSpot } from "@/components/Banners";
import { TopSkinHouse } from "@/components/TopSkinHouse";

const SLOT: BannerSlot = "SKIN";

/** One bordered line of words under the header; the spot always stays for sale. */
export async function TopSkinBanner() {
  const [banner] = await activeBanners(SLOT, 1);

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-4 pt-2">
      {banner ? (
        <a
          href={`/api/banners/${banner.id}/click`}
          target="_blank"
          rel="noreferrer sponsored"
          title={banner.title}
          className="flex h-9 w-full min-w-0 items-center justify-center rounded-lg border-2 border-indigo-400 bg-white px-3 text-sm font-semibold text-slate-800 hover:bg-indigo-50"
        >
          <BannerImpression id={banner.id} />
          <span className="truncate">{banner.title}</span>
          <span className="ml-2 shrink-0 text-indigo-600" aria-hidden>
            →
          </span>
        </a>
      ) : (
        <TopSkinHouse />
      )}
      <BookThisSpot
        slot={SLOT}
        label="top strip"
        className="mt-0.5 block text-right"
      />
    </div>
  );
}
