import Link from "next/link";
import { whatsappLink } from "@/lib/format";

type FaceCategory = { slug: string; name: string; icon?: string | null };

export type CardFaceBusiness = {
  slug: string;
  name: string;
  profileType: string;
  category: string;
  city: string | null;
  state: string | null;
  country: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  whatsappNumber: string | null;
  phone: string | null;
  publicEmail: string | null;
  address: string | null;
  mapsUrl: string | null;
  specialties: string[];
  verifiedProvider: boolean;
  categoryRef: FaceCategory | null;
  subcategoryRef: FaceCategory | null;
  deals: { id: string; title: string }[];
};

/**
 * The Popl-style card face — name, contact lines with the QR on the right,
 * category chips and live deals, like a printed business card. Embedded
 * beside the info on /business/<slug>.
 */
export function DigitalCardFace({
  business,
  featured,
  paidContact,
  extraCategories = [],
  ctaHref,
  ctaLabel,
}: {
  business: CardFaceBusiness;
  featured: boolean;
  /** Phone/email render only for paid members; WhatsApp is always shown. */
  paidContact: boolean;
  /** Extra categories the member picked (paid perk). */
  extraCategories?: FaceCategory[];
  ctaHref?: string;
  ctaLabel?: string;
  /** Optional footer call-to-action; hidden when unset. */
}) {
  const place = [business.city, business.state, business.country]
    .filter(Boolean)
    .join(", ");

  const cardLines: { emoji: string; text: string; href?: string }[] = [];
  if (business.whatsappNumber) {
    cardLines.push({
      emoji: "💬",
      text: `WhatsApp ${business.whatsappNumber}`,
      href: whatsappLink(
        business.whatsappNumber,
        `Hi ${business.name}, I found your card on Godesi.`,
      ),
    });
  }
  if (paidContact && business.phone) {
    cardLines.push({
      emoji: "📞",
      text: business.phone,
      href: `tel:${business.phone}`,
    });
  }
  if (paidContact && business.publicEmail) {
    cardLines.push({
      emoji: "✉️",
      text: business.publicEmail,
      href: `mailto:${business.publicEmail}`,
    });
  }
  if (business.websiteUrl) {
    cardLines.push({
      emoji: "🌐",
      text: business.websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, ""),
      href: business.websiteUrl,
    });
  }
  if (place) {
    cardLines.push({
      emoji: "📍",
      text: business.address ?? place,
      href: business.mapsUrl ?? undefined,
    });
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl bg-white shadow-xl ${
        featured ? "ring-2 ring-amber-400" : "ring-1 ring-slate-900/10"
      }`}
    >
      <div
        className={`h-2 ${
          featured
            ? "bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500"
            : "bg-gradient-to-r from-orange-500 via-rose-600 to-fuchsia-600"
        }`}
      />
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-extrabold leading-tight text-slate-900">
              {business.name}
            </h2>
            <p className="mt-1 text-sm font-semibold text-indigo-700">
              {business.category}
            </p>
            {featured ? (
              <span className="mt-2 inline-block rounded-full bg-amber-200 px-2 py-0.5 text-[11px] font-black uppercase tracking-wide text-amber-900">
                ⭐ Featured
              </span>
            ) : null}
            {business.verifiedProvider ? (
              <span className="ml-1 mt-2 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                ✓ Verified
              </span>
            ) : null}
          </div>
          {business.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={business.logoUrl}
              alt=""
              className="h-14 w-14 shrink-0 rounded-xl border border-slate-200 object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-2xl">
              {business.profileType === "PROFESSIONAL" ? "🧑‍💼" : "🏪"}
            </div>
          )}
        </div>

        {business.specialties.length ? (
          <p className="mt-2 line-clamp-2 text-xs text-slate-500">
            {business.specialties.slice(0, 5).join(" · ")}
          </p>
        ) : null}

        {/* Contact lines left, QR right — keeps the card slim */}
        <div className="mt-3 flex items-start gap-3 border-t border-slate-100 pt-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            {cardLines.map((line, index) => {
              const inner = (
                <>
                  <span aria-hidden>{line.emoji}</span>
                  <span className="truncate">{line.text}</span>
                </>
              );
              return line.href ? (
                <a
                  key={index}
                  href={line.href}
                  target={line.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    line.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="flex items-center gap-2 text-sm font-medium text-indigo-700 hover:underline"
                >
                  {inner}
                </a>
              ) : (
                <p
                  key={index}
                  className="flex items-center gap-2 text-sm font-medium text-slate-700"
                >
                  {inner}
                </p>
              );
            })}
            <p className="flex items-center gap-2 text-xs font-semibold text-rose-700">
              <span aria-hidden>🪪</span>
              godesi.com/business/{business.slug}
            </p>
          </div>
          <div className="shrink-0 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/qr/${business.slug}?card=1`}
              alt={`QR code for ${business.name}`}
              width={104}
              height={104}
              className="rounded-lg border border-slate-200"
            />
            <a
              href={`/api/qr/${business.slug}?card=1&download=1`}
              className="mt-1 block text-[10px] font-semibold text-indigo-600 hover:underline"
            >
              Scan me · Save QR
            </a>
          </div>
        </div>

        {/* Picked categories — clickable chips */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {business.categoryRef ? (
            <Link
              href={`/categories/${business.categoryRef.slug}`}
              className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
            >
              {business.categoryRef.icon} {business.categoryRef.name}
            </Link>
          ) : null}
          {business.subcategoryRef ? (
            <Link
              href={`/categories/${business.subcategoryRef.slug}`}
              className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700 hover:bg-violet-100"
            >
              {business.subcategoryRef.icon} {business.subcategoryRef.name}
            </Link>
          ) : null}
          {extraCategories.map((extra) => (
            <Link
              key={extra.slug}
              href={`/categories/${extra.slug}`}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200"
            >
              {extra.icon} {extra.name}
            </Link>
          ))}
        </div>

        {/* Live deals — part of the card face */}
        {business.deals.length ? (
          <div className="mt-3 space-y-1 rounded-xl bg-amber-50 p-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">
              🏷️ Deals
            </p>
            {business.deals.slice(0, 3).map((deal) => (
              <Link
                key={deal.id}
                href={`/business/${business.slug}`}
                className="block truncate text-sm font-semibold text-slate-800 hover:text-indigo-700"
              >
                • {deal.title}
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      <div
        className={`flex items-center justify-between px-5 py-2.5 ${
          featured
            ? "bg-gradient-to-r from-amber-500 to-yellow-600"
            : "bg-slate-900"
        }`}
      >
        <span className="text-[11px] font-bold uppercase tracking-widest text-white/90">
          {featured ? "GoDesi featured card" : "GoDesi digital card"}
        </span>
        {ctaHref ? (
          <Link
            href={ctaHref}
            className="text-[11px] font-semibold text-white hover:underline"
          >
            {ctaLabel ?? "Open →"}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
