import Link from "next/link";
import type { BusinessListItem } from "@/lib/businesses";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { StaffEditLink } from "@/components/StaffEditLink";
import { whatsappLink } from "@/lib/format";
import { thumbImage } from "@/lib/proxyImage";

/**
 * Photo-first card for the six-across rows: the picture does the selling and
 * the text is trimmed to a line each, so twenty of them still fit on a screen.
 */
export function BusinessTile({
  business,
  premium = false,
  smallImage = false,
}: {
  business: BusinessListItem;
  /** Adds the paid ribbon and gold frame. */
  premium?: boolean;
  /** Shorter picture, for the free rows below the paid strip. */
  smallImage?: boolean;
}) {
  const image = business.coverUrl ?? business.logoUrl;

  return (
    <div
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        premium ? "border-2 border-amber-300" : "border-slate-200"
      }`}
    >
      <StaffEditLink
        href={`/admin/business/${business.slug}`}
        className="absolute right-2 top-2 z-10 shadow"
        label="✏️"
      />
      <Link href={`/b/${business.slug}`} className="block bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image ? thumbImage(image, 384) : "/placeholder-logo.svg"}
          alt={`${business.name} — ${business.category} in ${business.city}`}
          loading="lazy"
          className={`w-full ${smallImage ? "h-20" : "h-32"} ${
            image
              ? "object-cover"
              : `object-contain ${smallImage ? "p-3" : "p-6"}`
          }`}
        />
      </Link>
      {premium ? (
        <span className="absolute left-2 top-2 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white shadow">
          ⭐ Premium
        </span>
      ) : null}

      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <Link
          href={`/b/${business.slug}`}
          className="line-clamp-1 text-sm font-bold text-slate-900 group-hover:text-indigo-600"
        >
          {business.name}
        </Link>
        <p className="line-clamp-1 text-xs text-slate-500">
          {business.category} · {business.city}
        </p>
        <div className="mt-auto pt-1.5">
          {business.whatsappNumber ? (
            <WhatsAppButton
              slug={business.slug}
              href={whatsappLink(
                business.whatsappNumber,
                `Hi ${business.name}, I found you on Godesi.`,
              )}
              label="WhatsApp"
              className="w-full !px-2 !py-1.5 !text-xs"
            />
          ) : (
            <Link
              href={`/b/${business.slug}`}
              className="block rounded-lg border border-slate-300 px-2 py-1.5 text-center text-xs font-semibold hover:bg-slate-50"
            >
              View card
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
