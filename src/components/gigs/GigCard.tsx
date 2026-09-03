import Link from "next/link";
import { properName } from "@/lib/names";
import {
  AUTO_RELEASE_DAYS,
  CARD_RATE_FIXED_USD,
  CARD_RATE_PERCENT,
  GIG_FEE_USD,
  averageRating,
  cardCostUsd,
  usd,
} from "@/lib/gigs";

export type GigCardData = {
  slug: string;
  title: string;
  description: string;
  priceMinor: number;
  deliveryDays: number;
  images: string[];
  ratingSum: number;
  ratingCount: number;
  packages: { tier: string }[];
  seller: {
    name: string;
    username: string | null;
    avatarUrl: string | null;
    headline: string | null;
  };
};

export function SellerFace({
  seller,
  size = "h-9 w-9",
}: {
  seller: { name: string; avatarUrl: string | null };
  size?: string;
}) {
  return seller.avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={seller.avatarUrl}
      alt={seller.name}
      className={`${size} shrink-0 rounded-full object-cover`}
    />
  ) : (
    <span
      className={`${size} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-600 text-sm font-black text-white`}
    >
      {seller.name.slice(0, 1).toUpperCase()}
    </span>
  );
}

export function GigCard({
  gig,
  showSeller = true,
}: {
  gig: GigCardData;
  showSeller?: boolean;
}) {
  const rating = averageRating(gig.ratingSum, gig.ratingCount);
  return (
    <Link
      href={`/gigs/${gig.slug}`}
      className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {gig.images[0] ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={gig.images[0]}
          alt=""
          className="aspect-[16/10] w-full object-cover"
        />
      ) : null}
      <div className="flex flex-1 flex-col p-4">
        {showSeller ? (
          <span className="mb-2 flex min-w-0 items-center gap-2 text-xs">
            <SellerFace seller={gig.seller} size="h-6 w-6" />
            <span className="truncate font-semibold text-slate-700">
              {properName(gig.seller.name)}
            </span>
          </span>
        ) : null}
        <p className="font-bold leading-snug text-slate-900">{gig.title}</p>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600">
          {gig.description}
        </p>
        <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            {gig.ratingCount ? (
              <span className="font-semibold text-amber-600">
                ★ {rating.toFixed(1)}{" "}
                <span className="font-normal text-slate-500">({gig.ratingCount})</span>
              </span>
            ) : (
              <>⏱ {gig.deliveryDays} day{gig.deliveryDays === 1 ? "" : "s"}</>
            )}
          </span>
          <span className="shrink-0 text-sm font-black text-slate-900">
            {gig.packages.length > 1 ? (
              <span className="text-xs font-normal text-slate-500">from </span>
            ) : null}
            {usd(gig.priceMinor)}
          </span>
        </div>
      </div>
    </Link>
  );
}

/**
 * Why Godesi keeps $2: the card company takes most of it. Shown to buyers on the
 * gig page and to sellers where they set a price, with the sum for that price.
 */
export function FeeNote({
  priceMinor,
  audience,
}: {
  priceMinor: number;
  audience: "buyer" | "seller";
}) {
  const price = priceMinor / 100;
  const card = cardCostUsd(price);
  const kept = GIG_FEE_USD - card;
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-bold">
        {audience === "buyer"
          ? `You pay ${usd(priceMinor)}. The seller gets ${usd(priceMinor - GIG_FEE_USD * 100)}.`
          : `On a ${usd(priceMinor)} gig you receive ${usd(priceMinor - GIG_FEE_USD * 100)}.`}
      </p>
      <p className="mt-1">
        Godesi keeps a flat <strong>${GIG_FEE_USD}</strong> per order, and here
        is why: the card processor charges {CARD_RATE_PERCENT}% + $
        {CARD_RATE_FIXED_USD.toFixed(2)} on every payment — ${card.toFixed(2)}{" "}
        on this one — so{" "}
        {kept > 0
          ? `about $${kept.toFixed(2)} is left to run the site, hold the money safely and settle any dispute.`
          : "on this gig the card fee alone eats the whole $2; we take nothing more."}{" "}
        No percentage, no listing fee, no monthly charge.
      </p>
      <p className="mt-1 text-xs">
        Payment is held by Godesi until the buyer confirms the work, or{" "}
        {AUTO_RELEASE_DAYS} days after delivery if they say nothing. A problem
        raised in that window is settled by our staff — release or full refund.
      </p>
    </div>
  );
}
