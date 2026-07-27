import Link from "next/link";
import {
  activeBanners,
  HEADER_SIZE,
  SIDEBAR_SIZE,
  SIDEBAR_SLOTS,
  SKYSCRAPER_SIZE,
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

/** The sponsored rail: 300x250 rectangles followed by 160x600 skyscrapers. */
export async function SidebarBanners() {
  const [rectangles, skyscrapers] = await Promise.all([
    activeBanners("SIDEBAR"),
    activeBanners("SKYSCRAPER"),
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
        length: Math.min(3, Math.max(SIDEBAR_SLOTS - rectangles.length, 0)),
      }).map((_, index) => (
        <AdvertiseHere
          key={`sidebar-open-${index}`}
          label={`300 × 250 sidebar banner · slot ${rectangles.length + index + 1}`}
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
