import Link from "next/link";
import type { BannerSlot } from "@prisma/client";
import {
  activeBanners,
  HEADER_SIZE,
  SIDEBAR_SIZE,
  SIDEBAR_SLOTS,
  SKYSCRAPER_SIZE,
  slotSoldCount,
} from "@/lib/banners";
import { ActivityWall } from "@/components/ActivityWall";
import { TelegramJoin } from "@/components/TelegramJoin";
import { HelpClipCard } from "@/components/HelpClipCard";
import { CategoryNav } from "@/components/CategoryNav";
import { DjsWikiCard } from "@/components/DjsWikiPromo";
import { GodesiWikiCard } from "@/components/GodesiWikiPromo";
import { isPhoneRequest } from "@/lib/device";
import { BannerImpression } from "@/components/BannerImpression";
import { AdSenseUnit } from "@/components/AdSenseUnit";
import { HousePromo } from "@/components/HousePromo";
import { proxyImage } from "@/lib/proxyImage";
import { AD_PLACEMENTS } from "@/lib/ads";
import { SmallBannerRail } from "@/components/SmallBannerRail";

/** AdSense slot ids per placement, so unsold space still earns. */
const ADSENSE_SLOTS: Partial<Record<BannerSlot, string | undefined>> = {
  HEADER: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HEADER,
  SIDEBAR: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR,
  SKYSCRAPER: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SKYSCRAPER,
  LEADERBOARD: process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE,
  INCONTENT: process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE,
  MOBILE: process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE,
  FULLBANNER: process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE,
  BILLBOARD: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HERO,
  HALFPAGE: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR,
};

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
  sellSlot,
  sellLabel,
}: {
  banner: BannerRow;
  width: number;
  height: number;
  className?: string;
  /** Adds a "post your banner here" line underneath, so filled spots still sell. */
  sellSlot?: BannerSlot;
  sellLabel?: string;
}) {
  const creative = (
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
        src={proxyImage(banner.imageUrl)}
        alt={banner.title}
        width={width}
        height={height}
        loading="lazy"
        className="h-auto w-full object-cover"
      />
    </a>
  );

  if (!sellSlot) return creative;

  return (
    <div className="space-y-1">
      {creative}
      <BookThisSpot
        slot={sellSlot}
        label={sellLabel ?? "post your banner here"}
      />
    </div>
  );
}

/** Empty inventory is sold, not hidden: every free slot invites an advertiser. */
function AdvertiseHere({
  label,
  height,
  width,
  slot,
  className = "",
  network = true,
}: {
  label: string;
  height: number;
  width: number;
  slot: BannerSlot;
  className?: string;
  /** False keeps ad-network units off; GoDesi's own promos fill the spot. */
  network?: boolean;
}) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const adsenseSlot = network ? ADSENSE_SLOTS[slot] : undefined;

  if (client && adsenseSlot) {
    return (
      <div className={className}>
        <AdSenseUnit
          client={client}
          slotId={adsenseSlot}
          height={height}
          fallback={<HousePromo width={width} height={height} seed={label} />}
        />
        <BookThisSpot slot={slot} label={label} />
      </div>
    );
  }

  return (
    <div className={className}>
      <HousePromo width={width} height={height} seed={label} />
      <span className="sr-only">{label}</span>
      <BookThisSpot slot={slot} label={label} />
    </div>
  );
}

/** Even a filled spot stays for sale: the next advertiser can book the rotation. */
function BookThisSpot({ slot, label }: { slot: BannerSlot; label: string }) {
  return (
    <Link
      href={`/advertise?slot=${slot}#book`}
      className="block text-center text-[11px] font-semibold text-slate-400 hover:text-indigo-600"
    >
      Book this spot — {label}
    </Link>
  );
}

/**
 * The sponsored rail: two rotating 300x250 rectangles plus a pair of skyscrapers.
 * Showing a couple per view lets ten advertisers share the slot and keeps each
 * page view from burning everyone's impression quota at once.
 */
export async function SidebarBanners({
  categorySlug = null,
  parentSlug = null,
  network = true,
}: {
  /** False for pages kept out of the ad network (see thinContent.ts). */
  network?: boolean;
  /** Lets a category page offer its own "how it works" clip. */
  categorySlug?: string | null;
  parentSlug?: string | null;
} = {}) {
  // The rail is hidden below lg, and rendering it for a phone anyway shipped a
  // live map, a chat poll, banner impressions and ad units nobody could see.
  if (isPhoneRequest()) return null;

  const [rectangles, halfPages, skyscrapers, rectanglesSold] =
    await Promise.all([
      activeBanners("SIDEBAR", 2),
      activeBanners("HALFPAGE", 1),
      activeBanners("SKYSCRAPER", 2),
      slotSoldCount("SIDEBAR"),
    ]);

  return (
    <aside
      className="hidden w-[260px] shrink-0 space-y-4 lg:order-first lg:block"
      aria-label="Sponsored"
    >
      <CategoryNav />

      <HelpClipCard categorySlug={categorySlug} parentSlug={parentSlug} />

      <GodesiWikiCard />

      <DjsWikiCard />

      <TelegramJoin compact />

      <ActivityWall />

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Sponsored
      </p>
      {rectangles.map((banner) => (
        <BannerLink
          key={banner.id}
          banner={banner}
          width={SIDEBAR_SIZE.width}
          height={SIDEBAR_SIZE.height}
          sellSlot="SIDEBAR"
          sellLabel="post your banner here — 300 × 250"
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
          width={SIDEBAR_SIZE.width}
          slot="SIDEBAR"
          network={network}
        />
      ))}
      {/* One 300x600 half page under the rectangles, if anyone has booked it. */}
      {halfPages.map((banner) => (
        <BannerLink
          key={banner.id}
          banner={banner}
          width={AD_PLACEMENTS.HALFPAGE.size.width}
          height={AD_PLACEMENTS.HALFPAGE.size.height}
          sellSlot="HALFPAGE"
          sellLabel="300 × 600 half page, shown in rotation"
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
            sellSlot="SKYSCRAPER"
            sellLabel="your banner here"
          />
        ))}
        {Array.from({
          length: Math.max(2 - Math.min(skyscrapers.length, 2), 0),
        }).map((_, index) => (
          <AdvertiseHere
            key={`sky-open-${index}`}
            label="160 × 600"
            height={SKYSCRAPER_SIZE.height}
            width={SKYSCRAPER_SIZE.width}
            slot="SKYSCRAPER"
            network={network}
          />
        ))}
      </div>
    </aside>
  );
}

/**
 * The 320x100 small banners stacked down the right side. Up to twenty are sent
 * so the stack can show a fresh set on each page change.
 */
export async function SmallBanners({
  show = 10,
  embedded = false,
}: {
  show?: number;
  embedded?: boolean;
} = {}) {
  if (isPhoneRequest()) return null;
  const banners = await activeBanners("MOBILE", 20);
  return (
    <SmallBannerRail
      show={show}
      embedded={embedded}
      banners={banners.map((banner) => ({
        id: banner.id,
        title: banner.title,
        imageUrl: proxyImage(banner.imageUrl),
      }))}
    />
  );
}

/** Full-width leaderboard above the footer, so long pages end on inventory. */
export async function FooterBanner() {
  const [banner] = await activeBanners("HEADER");

  if (!banner) {
    return (
      <AdvertiseHere
        label="970 × 90 leaderboard — rotates with other advertisers"
        height={HEADER_SIZE.height}
        width={HEADER_SIZE.width}
        slot="HEADER"
      />
    );
  }

  return (
    <div className="space-y-1">
      <BannerLink
        banner={banner}
        width={HEADER_SIZE.width}
        height={HEADER_SIZE.height}
        className="mx-auto max-w-full"
      />
      <BookThisSpot slot="HEADER" label="970 × 90 leaderboard" />
    </div>
  );
}

/**
 * A standard-size unit dropped between the cards on a listing, news or event
 * page. Desktop gets the 728x90 leaderboard, phones the 320x100 — one booking
 * per size, both rotating between the advertisers sharing that slot.
 */
export async function InContentBanner({
  size = "leaderboard",
}: {
  /** Swaps the desktop unit for the 336x280 rectangle or the 468x60 banner. */
  size?: "leaderboard" | "rectangle" | "full";
}) {
  const bySize: Record<typeof size & string, BannerSlot> = {
    leaderboard: "LEADERBOARD",
    rectangle: "INCONTENT",
    full: "FULLBANNER",
  };
  const desktopSlot = bySize[size];
  // 468x60 bookings take turns in the leaderboard spot, since affiliate
  // creatives mostly come in that size.
  const sharedSlots: BannerSlot[] =
    desktopSlot === "LEADERBOARD"
      ? ["LEADERBOARD", "FULLBANNER"]
      : [desktopSlot];
  const mobile = AD_PLACEMENTS.MOBILE.size;

  const [wide, phone] = await Promise.all([
    activeBanners(sharedSlots, 1),
    activeBanners("MOBILE", 1),
  ]);

  const wideSlot = wide[0]?.slot ?? desktopSlot;
  const desktop = AD_PLACEMENTS[wideSlot].size;

  return (
    <div className="my-4" aria-label="Sponsored">
      <div className="hidden sm:block">
        {wide[0] ? (
          <BannerLink
            banner={wide[0]}
            width={desktop.width}
            height={desktop.height}
            className="mx-auto"
            sellSlot={wideSlot}
            sellLabel={`${desktop.width} × ${desktop.height}, shown in rotation`}
          />
        ) : (
          <AdvertiseHere
            label={`${desktop.width} × ${desktop.height} in-content banner`}
            width={desktop.width}
            height={desktop.height}
            slot={wideSlot}
            className="mx-auto"
          />
        )}
      </div>
      <div className="sm:hidden">
        {phone[0] ? (
          <BannerLink
            banner={phone[0]}
            width={mobile.width}
            height={mobile.height}
            className="mx-auto max-w-[320px]"
            sellSlot="MOBILE"
            sellLabel="320 × 100, shown in rotation"
          />
        ) : (
          <AdvertiseHere
            label="320 × 100 mobile banner"
            width={mobile.width}
            height={mobile.height}
            slot="MOBILE"
            className="mx-auto max-w-[320px]"
          />
        )}
      </div>
    </div>
  );
}

/** The 970x250 billboard at the top of the busiest listing pages. */
export async function BillboardBanner() {
  const size = AD_PLACEMENTS.BILLBOARD.size;
  const [banner] = await activeBanners("BILLBOARD", 1);

  if (!banner) {
    return (
      <AdvertiseHere
        label="970 × 250 billboard"
        width={size.width}
        height={size.height}
        slot="BILLBOARD"
        className="mb-4 hidden sm:block"
      />
    );
  }

  return (
    <div className="mb-4 hidden sm:block">
      <BannerLink
        banner={banner}
        width={size.width}
        height={size.height}
        sellSlot="BILLBOARD"
        sellLabel="970 × 250 billboard, shown in rotation"
      />
    </div>
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
          sellSlot="SIDEBAR"
          sellLabel="post your banner here — 300 × 250"
        />
      ) : (
        <AdvertiseHere
          label="300 × 250 sidebar banner"
          height={SIDEBAR_SIZE.height}
          width={SIDEBAR_SIZE.width}
          slot="SIDEBAR"
          className="mx-auto max-w-[300px]"
        />
      )}
    </div>
  );
}

/** The single full-width banner under the header. */
export async function HeaderBanner() {
  const [banner] = await activeBanners("HEADER");

  /** Unsold, a 970×90 leaderboard is dead space above the fold on a phone. */
  if (!banner) {
    return (
      <AdvertiseHere
        label="970 × 90 header leaderboard"
        height={HEADER_SIZE.height}
        width={HEADER_SIZE.width}
        slot="HEADER"
        className="mb-4 hidden sm:block"
      />
    );
  }

  return (
    <div className="mb-4 space-y-1">
      <BannerLink
        banner={banner}
        width={HEADER_SIZE.width}
        height={HEADER_SIZE.height}
      />
      <BookThisSpot slot="HEADER" label="970 × 90 leaderboard" />
    </div>
  );
}

/**
 * Two 300x250 rectangles for a page's own right-hand column, so a short side
 * column still carries rotating sponsors (or Godesi promos when unsold).
 */
export async function RailRectangles() {
  const banners = await activeBanners("SIDEBAR", 2);

  return (
    <div className="space-y-4" aria-label="Sponsored">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Sponsored
      </p>
      {banners.map((banner) => (
        <BannerLink
          key={banner.id}
          banner={banner}
          width={SIDEBAR_SIZE.width}
          height={SIDEBAR_SIZE.height}
          className="mx-auto max-w-[300px]"
          sellSlot="SIDEBAR"
          sellLabel="post your banner here — 300 × 250"
        />
      ))}
      {Array.from({ length: Math.max(2 - banners.length, 0) }).map(
        (_, index) => (
          <AdvertiseHere
            key={`rail-open-${index}`}
            label={`300 × 250 sidebar banner · profile ${index + 1}`}
            height={SIDEBAR_SIZE.height}
            width={SIDEBAR_SIZE.width}
            slot="SIDEBAR"
            className="mx-auto max-w-[300px]"
          />
        ),
      )}
    </div>
  );
}
