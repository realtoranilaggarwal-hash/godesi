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
import { BannerImpression } from "@/components/BannerImpression";
import { AdSenseUnit } from "@/components/AdSenseUnit";
import { AdPreview } from "@/components/AdPreview";

/** AdSense slot ids per placement, so unsold space still earns. */
const ADSENSE_SLOTS: Partial<Record<BannerSlot, string | undefined>> = {
  HERO: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HERO,
  HEADER: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HEADER,
  SIDEBAR: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR,
  SKYSCRAPER: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SKYSCRAPER,
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
        <AdSenseUnit client={client} slotId={adsenseSlot} height={height} />
        <BookThisSpot slot={slot} label={label} />
      </div>
    );
  }

  return (
    <Link
      href={`/advertise?slot=${slot}#book`}
      className={`block transition hover:opacity-90 ${className}`}
    >
      <AdPreview width={width} height={height} sub={label} />
      <span className="mt-1 block text-center text-xs font-semibold text-indigo-600">
        Book this spot — monthly or pay per views →
      </span>
    </Link>
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
          width={SIDEBAR_SIZE.width}
          slot="SIDEBAR"
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

  if (!banner) {
    return (
      <AdvertiseHere
        label="970 × 90 header leaderboard"
        height={HEADER_SIZE.height}
        width={HEADER_SIZE.width}
        slot="HEADER"
        className="mb-4"
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
