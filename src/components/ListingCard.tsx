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
import type {
  Furnishing,
  GenderPreference,
  ListingKind,
  PostedByRole,
} from "@prisma/client";
import { POSTED_BY_LABELS, areaLabel, propertyTypeLabel } from "@/lib/property";
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
  categorySlug: string | null;
  featured: boolean;
  /** Property extras; absent on rooms and buy & sell cards. */
  propertyType?: string | null;
  postedByRole?: PostedByRole | null;
  bathrooms?: number | null;
  builtUpArea?: number | null;
  carpetArea?: number | null;
  areaUnit?: string | null;
  nriFriendly?: boolean;
  investmentDeal?: boolean;
  images: { url: string }[];
  owner: { name: string; username: string | null; avatarUrl: string | null };
};

export function ListingCard({
  listing,
  cityBase = "/real-estate",
  categoryName,
}: {
  listing: ListingCardItem;
  /** Section the city link should filter, e.g. "/rooms" or "/marketplace". */
  cityBase?: string;
  /** Buy & sell category label, when the section knows the taxonomy. */
  categoryName?: string;
}) {
  const area = listing.builtUpArea || listing.carpetArea
    ? areaLabel({
        builtUpArea: listing.builtUpArea ?? null,
        carpetArea: listing.carpetArea ?? null,
        areaUnit: listing.areaUnit ?? null,
      })
    : null;

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
            {listing.kind === "MARKETPLACE" ? "🛍️" : "🏡"}
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone="indigo">{KIND_LABELS[listing.kind]}</Badge>
          {categoryName ? <Badge tone="green">{categoryName}</Badge> : null}
          {listing.featured ? <Badge tone="amber">Featured</Badge> : null}
          {listing.propertyType ? (
            <Badge tone="green">{propertyTypeLabel(listing.propertyType)}</Badge>
          ) : null}
          {listing.nriFriendly ? <Badge tone="indigo">🌏 NRI</Badge> : null}
          {listing.investmentDeal ? <Badge tone="amber">📈 Investment</Badge> : null}
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
          {listing.bathrooms ? ` · ${listing.bathrooms} bath` : ""}
        </p>
        {area ? <p className="text-xs text-slate-500">📏 {area}</p> : null}
        <p className="text-lg font-black text-emerald-700">{priceLabel(listing)}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
          <PostedBy user={listing.owner} />
          {listing.postedByRole ? (
            <span className="text-xs font-semibold text-slate-500">
              {POSTED_BY_LABELS[listing.postedByRole]}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
