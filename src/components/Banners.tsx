import Link from "next/link";
import {
  activeBanners,
  HEADER_SIZE,
  SIDEBAR_SIZE,
  SIDEBAR_SLOTS,
  SKYSCRAPER_SIZE,
  slotSoldCount,
} from "@/lib/banners";
import { BannerImpression } from "@/components/BannerImpression";

type BannerRow = {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
};

function BannerLink({
  banner,
  width,
  height,
  className = "",
}: {
  banner: BannerRow;
  width: number;
  height: number;
  className?: string;
}) {
  return (
    <a
      href={`/api/banners/${banner.id}/click`}
      target="_blank"
      rel="noreferrer sponsored"
      title={banner.title}
      className={`block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md ${className}`}
    >
      <BannerImpression id={banner.id} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={banner.imageUrl}
        alt={banner.title}
        width={width}
        height={height}
        loading="lazy"
        className="h-auto w-full object-cover"
      />
    </a>
  );
}

/** Empty inventory is sold, not hidden: every free slot invites an advertiser. */
function AdvertiseHere({
  label,
  height,
  className = "",
}: {
  label: string;
  height: number;
  className?: string;
}) {
  return (
    <Link
      href="/advertise"
      style={{ minHeight: height }}
      className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/60 p-4 text-center transition hover:border-indigo-400 hover:bg-indigo-50 ${className}`}
    >
      <span className="text-sm font-bold text-indigo-700">Advertise here</span>
      <span className="text-xs text-indigo-500">{label}</span>
      <span className="mt-1 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
        See rates →
      </span>
    </Link>
  );
}

/**
 * The sponsored rail: two rotating 300x250 rectangles plus a pair of skyscrapers.
 * Showing a couple per view lets ten advertisers share the slot and keeps each
 * page view from burning everyone's impression quota at once.
 */
export async function SidebarBanners() {
  const [rectangles, skyscrapers, rectanglesSold] = await Promise.all([
    activeBanners("SIDEBAR", 2),
    activeBanners("SKYSCRAPER", 2),
    slotSoldCount("SIDEBAR"),
  ]);

  return (
    <aside
      className="hidden w-[300px] shrink-0 space-y-4 lg:block"
      aria-label="Sponsored"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Sponsored
      </p>
      {rectangles.map((banner) => (
        <BannerLink
          key={banner.id}
          banner={banner}
          width={SIDEBAR_SIZE.width}
          height={SIDEBAR_SIZE.height}
        />
      ))}
      {/* Show the first few unsold rectangles so the rail is visibly for sale. */}
      {Array.from({
        length: Math.min(2, Math.max(SIDEBAR_SLOTS - rectanglesSold, 0)),
      }).map((_, index) => (
        <AdvertiseHere
          key={`sidebar-open-${index}`}
          label={`300 × 250 sidebar banner · slot ${rectanglesSold + index + 1}`}
          height={SIDEBAR_SIZE.height}
        />
      ))}
      {/* Skyscrapers run two-up so the pair fills the same 300px rail width. */}
      <div className="grid grid-cols-2 gap-3">
        {skyscrapers.slice(0, 2).map((banner) => (
          <BannerLink
            key={banner.id}
            banner={banner}
            width={SKYSCRAPER_SIZE.width}
            height={SKYSCRAPER_SIZE.height}
          />
        ))}
        {Array.from({
          length: Math.max(2 - Math.min(skyscrapers.length, 2), 0),
        }).map((_, index) => (
          <AdvertiseHere
            key={`sky-open-${index}`}
            label="160 × 600"
            height={SKYSCRAPER_SIZE.height}
          />
        ))}
      </div>
    </aside>
  );
}

/** Full-width leaderboard above the footer, so long pages end on inventory. */
export async function FooterBanner() {
  const [banner] = await activeBanners("HEADER");

  if (!banner) {
    return (
      <AdvertiseHere
        label="970 × 90 leaderboard — rotates with other advertisers"
        height={90}
      />
    );
  }

  return (
    <BannerLink
      banner={banner}
      width={HEADER_SIZE.width}
      height={HEADER_SIZE.height}
    />
  );
}

/** A single in-content rectangle for narrow screens, where the rail is hidden. */
export async function InlineBanner() {
  const [banner] = await activeBanners("SIDEBAR", 1);

  return (
    <div className="lg:hidden" aria-label="Sponsored">
      {banner ? (
        <BannerLink
          banner={banner}
          width={SIDEBAR_SIZE.width}
          height={SIDEBAR_SIZE.height}
          className="mx-auto max-w-[300px]"
        />
      ) : (
        <AdvertiseHere
          label="300 × 250 sidebar banner"
          height={SIDEBAR_SIZE.height}
          className="mx-auto max-w-[300px]"
        />
      )}
    </div>
  );
}

/** The single full-width banner under the header. */
export async function HeaderBanner() {
  const [banner] = await activeBanners("HEADER");

  if (!banner) {
    return (
      <AdvertiseHere
        label="970 × 90 header leaderboard"
        height={90}
        className="mb-4"
      />
    );
  }

  return (
    <BannerLink
      banner={banner}
      width={HEADER_SIZE.width}
      height={HEADER_SIZE.height}
      className="mb-4"
    />
  );
}
