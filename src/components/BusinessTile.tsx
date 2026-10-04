import Link from "next/link";
import type { BusinessListItem } from "@/lib/businesses";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { StaffEditLink } from "@/components/StaffEditLink";
import { whatsappLink } from "@/lib/format";
import { thumbImage } from "@/lib/proxyImage";

/**
 * News-style card for the business grids: thumbnail on the left, write-up
 * beside it, every line clamped so a long or short description never changes
 * the box — all tiles in a row are the same size.
 */
export function BusinessTile({
  business,
  premium = false,
}: {
  business: BusinessListItem;
  /** Adds the paid ribbon and gold frame. */
  premium?: boolean;
}) {
  const image = business.coverUrl ?? business.logoUrl;
  const href = `/b/${business.slug}`;
  const frame = `group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
    premium ? "border-amber-300 ring-1 ring-amber-200" : "border-slate-200"
  }`;
  const facts = [
    business.reviewCount ? `★ ${business.rating.toFixed(1)}` : null,
    business.verifiedProvider ? "✓ Verified" : null,
    business.yearsExperience ? `${business.yearsExperience}+ yrs` : null,
    business.priceFrom ? `From ${business.priceFrom}` : null,
  ].filter(Boolean);
  const blurb =
    business.description?.trim() ||
    (business.specialties.length
      ? business.specialties.slice(0, 4).join(" · ")
      : `${business.subcategoryName ?? business.category} in ${business.city}.`);

  return (
    <div className={frame}>
      <StaffEditLink
        href={`/admin/business/${business.slug}`}
        className="absolute right-2 top-2 z-10 shadow"
        label="✏️"
      />
      <Link href={href} className="flex gap-3">
        <span className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-slate-800">
          {image ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbImage(image, 384)}
                alt=""
                aria-hidden
                loading="lazy"
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-md"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbImage(image, 384)}
                alt={`${business.name} — ${business.category} in ${business.city}`}
                loading="lazy"
                className="relative h-full w-full object-contain"
              />
            </>
          ) : (
            <span
              role="img"
              aria-label={business.name}
              className="flex h-full w-full items-center justify-center bg-indigo-50 text-3xl leading-none"
            >
              {business.categoryIcon || "🏷️"}
            </span>
          )}
          {premium ? (
            <span className="absolute left-1 top-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white shadow">
              ⭐ Featured
            </span>
          ) : null}
        </span>
        <span className="min-w-0 flex-1">
          <span className="line-clamp-1 font-semibold leading-snug text-slate-900 group-hover:text-indigo-600">
            {business.name}
          </span>
          <span className="line-clamp-1 text-xs text-slate-500">
            {business.subcategoryName ?? business.category} · {business.city}
          </span>
          <span className="mt-1 line-clamp-2 h-10 text-sm leading-5 text-slate-600">
            {blurb}
          </span>
        </span>
      </Link>
      <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
        <span className="line-clamp-1 min-w-0 text-[11px] font-semibold text-slate-600">
          {facts.length ? facts.join(" · ") : "On GoDesi"}
        </span>
        {business.whatsappNumber ? (
          <WhatsAppButton
            slug={business.slug}
            href={whatsappLink(
              business.whatsappNumber,
              `Hi ${business.name}, I found you on Godesi.`,
            )}
            label="WhatsApp"
            className="shrink-0 !px-2 !py-1 !text-xs"
          />
        ) : (
          <Link
            href={href}
            className="shrink-0 rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold hover:bg-slate-50"
          >
            View card
          </Link>
        )}
      </div>
    </div>
  );
}
