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
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbImage(image, 384)}
            alt={`${business.name} — ${business.category} in ${business.city}`}
            loading="lazy"
            className={`w-full ${smallImage ? "h-20" : "h-32"} object-cover`}
          />
        ) : (
          <span
            role="img"
            aria-label={business.name}
            className={`flex w-full ${
              smallImage ? "h-20 text-3xl" : "h-32 text-5xl"
            } items-center justify-center bg-indigo-50 leading-none`}
          >
            {business.categoryIcon || "🏷️"}
          </span>
        )}
      </Link>
      {premium ? (
        <span className="absolute left-2 top-2 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white shadow">
          ⭐ Featured
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
          {business.subcategoryName ?? business.category} · {business.city}
        </p>
        {premium ? (
          <>
            <p className="flex flex-wrap items-center gap-x-2 text-[11px] font-semibold text-slate-700">
              {business.reviewCount ? (
                <span className="text-amber-600">
                  ★ {business.rating.toFixed(1)}{" "}
                  <span className="font-normal text-slate-500">
                    ({business.reviewCount})
                  </span>
                </span>
              ) : null}
              {business.verifiedProvider ? (
                <span className="text-emerald-700">✓ Verified</span>
              ) : null}
              {business.yearsExperience ? (
                <span className="text-slate-600">
                  {business.yearsExperience}+ yrs
                </span>
              ) : null}
              {business.priceFrom ? (
                <span className="text-slate-600">From {business.priceFrom}</span>
              ) : null}
            </p>
            {business.description ? (
              <p className="line-clamp-2 text-[11px] leading-snug text-slate-600">
                {business.description}
              </p>
            ) : null}
            {business.specialties.length ? (
              <p className="line-clamp-1 text-[10px] text-indigo-700">
                {business.specialties.slice(0, 4).join(" · ")}
              </p>
            ) : null}
          </>
        ) : null}
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
