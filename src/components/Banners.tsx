import Link from "next/link";
import Image from "next/image";
import type { BannerSlot } from "@prisma/client";
import {
  activeBanners,
  HEADER_SIZE,
  HERO_SIZE,
  SIDEBAR_SIZE,
  SIDEBAR_SLOTS,
  SKYSCRAPER_SIZE,
  slotSoldCount,
} from "@/lib/banners";
import { LiveVisitorMap } from "@/components/LiveVisitorMap";
import { ActivityWall } from "@/components/ActivityWall";
import { TelegramJoin } from "@/components/TelegramJoin";
import { ChatPanel } from "@/components/ChatPanel";
import { HelpClipCard } from "@/components/HelpClipCard";
import { BannerImpression } from "@/components/BannerImpression";
import { AdSenseUnit } from "@/components/AdSenseUnit";
import { HousePromo } from "@/components/HousePromo";
import { proxyImage } from "@/lib/proxyImage";
import { AD_PLACEMENTS } from "@/lib/ads";

/** AdSense slot ids per placement, so unsold space still earns. */
const ADSENSE_SLOTS: Partial<Record<BannerSlot, string | undefined>> = {
  HERO: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HERO,
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
}: {
  label: string;
  height: number;
  width: number;
  slot: BannerSlot;
  className?: string;
}) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const adsenseSlot = ADSENSE_SLOTS[slot];

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
}: {
  /** Lets a category page offer its own "how it works" clip. */
  categorySlug?: string | null;
  parentSlug?: string | null;
} = {}) {
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
      <HelpClipCard categorySlug={categorySlug} parentSlug={parentSlug} />

      <LiveVisitorMap compact />

      <ChatPanel compact />

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
          />
        ))}
      </div>
    </aside>
  );
}

/**
 * The homepage hero: a paid full-width creative when one is booked, otherwise our
 * own artwork with an "advertise here" ribbon so the space still sells itself.
 */
export async function HeroBanner() {
  const [banner] = await activeBanners("HERO", 1);

  if (banner) {
    return (
      <div className="space-y-1">
        <BannerLink
          banner={banner}
          width={HERO_SIZE.width}
          height={HERO_SIZE.height}
          className="rounded-3xl"
        />
        <BookThisSpot slot="HERO" label="homepage hero, monthly or per views" />
      </div>
    );
  }

  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const adsenseSlot = ADSENSE_SLOTS.HERO;

  if (client && adsenseSlot) {
    return (
      <div>
        <AdSenseUnit
          client={client}
          slotId={adsenseSlot}
          height={HERO_SIZE.height}
          className="rounded-3xl"
          fallback={
            <HousePromo
              width={HERO_SIZE.width}
              height={HERO_SIZE.height}
              seed="hero"
            />
          }
        />
        <BookThisSpot slot="HERO" label="homepage hero, monthly or per views" />
      </div>
    );
  }

  return (
    <Link
      href="/advertise?slot=HERO#book"
      className="group relative block overflow-hidden rounded-3xl"
    >
      <Image
        src="/hero-banner.jpg"
        alt="Godesi — your desi community directory: businesses, leads, events, news, connections"
        width={1983}
        height={793}
        priority
        sizes="100vw"
        className="h-auto w-full"
      />
      <span className="absolute bottom-3 right-3 rounded-xl bg-slate-900/80 px-3 py-2 text-xs font-bold text-white group-hover:bg-indigo-600 sm:text-sm">
        Book this spot — monthly or pay per views →
      </span>
    </Link>
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
  // A 468x60 booking fills the leaderboard spot too, since affiliate creatives
  // mostly come in that size and the wider unit would otherwise sit empty.
  const fallbackSlot: BannerSlot | null =
    desktopSlot === "LEADERBOARD" ? "FULLBANNER" : null;
  const mobile = AD_PLACEMENTS.MOBILE.size;

  const [primary, fallback, phone] = await Promise.all([
    activeBanners(desktopSlot, 1),
    fallbackSlot ? activeBanners(fallbackSlot, 1) : Promise.resolve([]),
    activeBanners("MOBILE", 1),
  ]);

  const wide = primary.length ? primary : fallback;
  const wideSlot =
    !primary.length && fallback.length && fallbackSlot
      ? fallbackSlot
      : desktopSlot;
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
