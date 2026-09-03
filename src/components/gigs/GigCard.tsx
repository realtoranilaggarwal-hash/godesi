import Link from "next/link";
import { properName } from "@/lib/names";
import {
  AUTO_RELEASE_DAYS,
  CARD_RATE_FIXED_USD,
  CARD_RATE_PERCENT,
  GIG_FEE_USD,
  cardCostUsd,
  usd,
} from "@/lib/gigs";

export type GigCardData = {
  slug: string;
  title: string;
  description: string;
  priceMinor: number;
  deliveryDays: number;
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
  return (
    <Link
      href={`/gigs/${gig.slug}`}
      className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-bold leading-snug text-slate-900">{gig.title}</p>
        <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-sm font-black text-emerald-700">
          {usd(gig.priceMinor)}
        </span>
      </div>
      <p className="mt-2 line-clamp-3 text-sm text-slate-600">
        {gig.description}
      </p>
      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-500">
        {showSeller ? (
          <span className="flex min-w-0 items-center gap-2">
            <SellerFace seller={gig.seller} size="h-6 w-6" />
            <span className="truncate font-semibold text-slate-700">
              {properName(gig.seller.name)}
            </span>
          </span>
        ) : (
          <span />
        )}
        <span className="shrink-0">
          ⏱ {gig.deliveryDays} day{gig.deliveryDays === 1 ? "" : "s"}
        </span>
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
