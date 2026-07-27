import Link from "next/link";
import type { BusinessListItem } from "@/lib/businesses";
import { Badge, Stars } from "@/components/ui";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { formatMoney, whatsappLink } from "@/lib/format";

function priceLabel(vendor: BusinessListItem) {
  if (vendor.startingPrice !== null) {
    return `From ${formatMoney(vendor.startingPrice, vendor.priceCurrency ?? "USD")}`;
  }
  return vendor.customQuote ? "Custom quote" : "Price on request";
}

/**
 * Photo-first card for the wedding marketplace: big image, price, rating,
 * service and city, with WhatsApp one tap away.
 */
export function VendorCard({ vendor }: { vendor: BusinessListItem }) {
  const cover = vendor.coverUrl ?? vendor.logoUrl;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <Link href={`/b/${vendor.slug}`} className="relative block">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={vendor.name}
            loading="lazy"
            className="h-44 w-full object-cover"
          />
        ) : (
          <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-rose-100 via-pink-100 to-amber-100 text-4xl">
            💐
          </div>
        )}
        {vendor.plan !== "FREE" || vendor.featured ? (
          <span className="absolute left-2 top-2 rounded-full bg-rose-600 px-2 py-0.5 text-[11px] font-bold text-white">
            ⭐ Featured
          </span>
        ) : null}
        <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
          {priceLabel(vendor)}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/b/${vendor.slug}`}
            className="line-clamp-1 font-bold text-slate-900 hover:text-rose-600"
          >
            {vendor.name}
          </Link>
          {vendor.plan !== "FREE" ? (
            <Badge tone="indigo">{vendor.plan}</Badge>
          ) : null}
        </div>

        <p className="text-xs font-semibold text-slate-500">
          {vendor.subcategoryName ?? vendor.category} · 📍 {vendor.city}
        </p>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Stars rating={vendor.rating} />
          <span>
            {vendor.reviewCount
              ? `${vendor.rating.toFixed(1)} (${vendor.reviewCount})`
              : "New on Godesi"}
          </span>
        </div>

        {vendor.description ? (
          <p className="line-clamp-2 text-sm text-slate-600">
            {vendor.description}
          </p>
        ) : null}

        <div className="mt-auto flex gap-2 pt-1">
          <Link
            href={`/b/${vendor.slug}`}
            className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-center text-sm font-semibold hover:bg-slate-50"
          >
            View profile
          </Link>
          {vendor.whatsappNumber ? (
            <WhatsAppButton
              slug={vendor.slug}
              href={whatsappLink(
                vendor.whatsappNumber,
                `Hi ${vendor.name}, I found you on Godesi and need a quote for my wedding.`,
              )}
              label="WhatsApp"
              className="flex-1 !px-3 !py-2"
            />
          ) : (
            <Link
              href={`/b/${vendor.slug}?claim=1`}
              className="flex-1 rounded-xl bg-amber-500 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-amber-600"
            >
              Claim
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
