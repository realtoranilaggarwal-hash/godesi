import type { BannerSlot } from "@prisma/client";
import { activeBanners } from "@/lib/banners";
import { BannerImpression } from "@/components/BannerImpression";
import { BookThisSpot } from "@/components/Banners";
import { TopSkinHouse } from "@/components/TopSkinHouse";

const SLOT: BannerSlot = "SKIN";
/** Tailwind's `xl`: the header copy shows from here up, the row copy below it. */
const XL_UP = "(min-width: 1280px)";

/**
 * One bordered line of words; the spot always stays for sale. "header" sits in
 * the header bar on wide screens, "row" is its own line under the header.
 */
export async function TopSkinBanner({
  variant = "row",
}: {
  variant?: "row" | "header";
}) {
  const [banner] = await activeBanners(SLOT, 1);
  const header = variant === "header";

  return (
    <div
      className={
        header
          ? "relative w-full min-w-0"
          : "mx-auto w-full max-w-screen-2xl px-4 pt-2"
      }
    >
      {banner ? (
        <a
          href={`/api/banners/${banner.id}/click`}
          target="_blank"
          rel="noreferrer sponsored"
          title={banner.title}
          className={`flex ${header ? "h-8" : "h-9"} w-full min-w-0 items-center justify-center rounded-lg border-2 border-indigo-400 bg-white px-3 text-sm font-semibold text-slate-800 hover:bg-indigo-50`}
        >
          <BannerImpression
            id={banner.id}
            media={header ? XL_UP : `not all and ${XL_UP}`}
          />
          <span className="truncate">{banner.title}</span>
          <span className="ml-2 shrink-0 text-indigo-600" aria-hidden>
            →
          </span>
        </a>
      ) : (
        <TopSkinHouse variant={variant} />
      )}
      <BookThisSpot
        slot={SLOT}
        label="top strip"
        className={
          header
            ? "absolute right-0 top-full block whitespace-nowrap leading-3"
            : "mt-0.5 block text-right"
        }
      />
    </div>
  );
}
