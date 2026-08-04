import Link from "next/link";
import { Badge } from "@/components/ui";
import { PostedBy } from "@/components/PostedBy";
import { PlaceLink } from "@/components/PlaceLink";
import {
  FURNISHING_LABELS,
  GENDER_LABELS,
  KIND_LABELS,
  priceLabel,
} from "@/lib/listings";
import type { Furnishing, GenderPreference, ListingKind } from "@prisma/client";
import { thumbImage } from "@/lib/proxyImage";

export type ListingCardItem = {
  slug: string;
  kind: ListingKind;
  title: string;
  city: string;
  area: string | null;
  price: number;
  currency: string;
  perMonth: boolean;
  bedrooms: number | null;
  furnishing: Furnishing | null;
  genderPref: GenderPreference | null;
  featured: boolean;
  images: { url: string }[];
  owner: { name: string; username: string | null; avatarUrl: string | null };
};

export function ListingCard({
  listing,
  cityBase = "/real-estate",
}: {
  listing: ListingCardItem;
  /** Section the city link should filter, e.g. "/rooms" or "/marketplace". */
  cityBase?: string;
}) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/listings/${listing.slug}`} className="block">
        {listing.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbImage(listing.images[0].url, 640)}
            alt={listing.title}
            className="h-44 w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-44 items-center justify-center bg-gradient-to-br from-orange-400 via-rose-500 to-fuchsia-600 text-5xl">
            🏡
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone="indigo">{KIND_LABELS[listing.kind]}</Badge>
          {listing.featured ? <Badge tone="amber">Featured</Badge> : null}
          {listing.furnishing ? (
            <Badge tone="slate">{FURNISHING_LABELS[listing.furnishing]}</Badge>
          ) : null}
          {listing.genderPref && listing.genderPref !== "ANY" ? (
            <Badge tone="slate">{GENDER_LABELS[listing.genderPref]}</Badge>
          ) : null}
        </div>

        <Link
          href={`/listings/${listing.slug}`}
          className="font-bold leading-snug group-hover:text-indigo-600"
        >
          {listing.title}
        </Link>
        <p className="text-sm text-slate-600">
          📍 {listing.area ? `${listing.area}, ` : ""}
          <PlaceLink city={listing.city} base={cityBase} />
          {listing.bedrooms ? ` · ${listing.bedrooms} BHK` : ""}
        </p>
        <p className="text-lg font-black text-emerald-700">{priceLabel(listing)}</p>
        <div className="mt-auto pt-1">
          <PostedBy user={listing.owner} />
        </div>
      </div>
    </div>
  );
}
