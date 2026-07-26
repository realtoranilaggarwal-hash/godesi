import { activeBanners, HEADER_SIZE, SIDEBAR_SIZE } from "@/lib/banners";
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

/** The 10-slot 300x250 sidebar rail. */
export async function SidebarBanners() {
  const banners = await activeBanners("SIDEBAR");
  if (!banners.length) return null;

  return (
    <aside className="hidden w-[300px] shrink-0 space-y-4 lg:block" aria-label="Sponsored">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Sponsored
      </p>
      {banners.map((banner) => (
        <BannerLink
          key={banner.id}
          banner={banner}
          width={SIDEBAR_SIZE.width}
          height={SIDEBAR_SIZE.height}
        />
      ))}
    </aside>
  );
}

/** The single full-width banner under the header. */
export async function HeaderBanner() {
  const [banner] = await activeBanners("HEADER");
  if (!banner) return null;

  return (
    <BannerLink
      banner={banner}
      width={HEADER_SIZE.width}
      height={HEADER_SIZE.height}
      className="mb-4"
    />
  );
}
