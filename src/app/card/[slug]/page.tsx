import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { siteUrl, whatsappLink } from "@/lib/format";
import { maskContactDetails } from "@/lib/moderation";
import { effectivePlan } from "@/lib/plans";
import { liveDealWhere } from "@/lib/deals";
import { CardLeadForm } from "@/components/CardLeadForm";
import { CardShareButton } from "@/components/CardShareButton";
import { ShareButtons } from "@/components/ShareButtons";

export const revalidate = 3600;

const getBusiness = cache((slug: string) =>
  db.business.findUnique({
    where: { slug },
    select: {
      slug: true,
      name: true,
      status: true,
      profileType: true,
      category: true,
      city: true,
      state: true,
      country: true,
      description: true,
      logoUrl: true,
      websiteUrl: true,
      whatsappNumber: true,
      phone: true,
      publicEmail: true,
      address: true,
      mapsUrl: true,
      specialties: true,
      verifiedProvider: true,
      hideContact: true,
      referralOffer: true,
      categorySlug: true,
      categoryRef: { select: { slug: true, name: true, icon: true } },
      subcategorySlug: true,
      subcategoryRef: { select: { slug: true, name: true, icon: true } },
      extraCategorySlugs: true,
      featuredRank: true,
      featuredUntil: true,
      owner: {
        select: { id: true, plan: true, planExpiresAt: true },
      },
      deals: {
        where: liveDealWhere(),
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { id: true, title: true },
      },
    },
  }),
);

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const business = await getBusiness(params.slug);
  if (!business) return { title: "Card not found" };
  return {
    title: `${business.name} — digital business card`,
    description: `${business.name} — ${business.category} in ${business.city}. Save the contact, chat on WhatsApp or share your details.`,
  };
}

export default async function CardPage({
  params,
}: {
  params: { slug: string };
}) {
  const business = await getBusiness(params.slug);
  if (!business || business.status !== "APPROVED") notFound();

  const cardUrl = `${siteUrl()}/card/${business.slug}`;
  const paidContact = business.owner
    ? effectivePlan(business.owner) !== "FREE" && !business.hideContact
    : false;
  const now = new Date();
  const featured =
    (business.featuredRank > 0 &&
      (!business.featuredUntil || business.featuredUntil > now)) ||
    (business.owner ? effectivePlan(business.owner) !== "FREE" : false);
  const extraCategories = business.extraCategorySlugs.length
    ? await db.category.findMany({
        where: { slug: { in: business.extraCategorySlugs } },
        select: { slug: true, name: true, icon: true },
        orderBy: { name: "asc" },
      })
    : [];
  const categories = await db.category.findMany({
    where: { parentSlug: null },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    take: 14,
    select: { slug: true, name: true, icon: true },
  });
  const place = [business.city, business.state, business.country]
    .filter(Boolean)
    .join(", ");

  // Contact rows drawn inside the card face, like a printed business card.
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
  if (place) cardLines.push({ emoji: "📍", text: business.address ?? place, href: business.mapsUrl ?? undefined });

  return (
    <div className="mx-auto max-w-md space-y-5 px-4 py-6">
      {/* The card face — laid out like a printed business card */}
      <div
        className={`overflow-hidden rounded-2xl bg-white shadow-xl ${
          featured
            ? "ring-2 ring-amber-400"
            : "ring-1 ring-slate-900/10"
        }`}
      >
        <div
          className={`h-2 ${
            featured
              ? "bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500"
              : "bg-gradient-to-r from-orange-500 via-rose-600 to-fuchsia-600"
          }`}
        />
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold leading-tight text-slate-900">
                {business.name}
              </h1>
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
                  ✓ Verified on GoDesi
                </span>
              ) : null}
            </div>
            {business.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={business.logoUrl}
                alt=""
                className="h-16 w-16 shrink-0 rounded-xl border border-slate-200 object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-2xl">
                {business.profileType === "PROFESSIONAL" ? "🧑‍💼" : "🏪"}
              </div>
            )}
          </div>

          {business.specialties.length ? (
            <p className="mt-3 line-clamp-2 text-xs text-slate-500">
              {business.specialties.slice(0, 5).join(" · ")}
            </p>
          ) : null}

          <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-4">
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
            <p className="flex items-center gap-2 text-sm font-semibold text-rose-700">
              <span aria-hidden>🪪</span>
              godesi.com/card/{business.slug}
            </p>
          </div>

          {/* Picked categories — clickable chips inside the card */}
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
              {business.deals.map((deal) => (
                <Link
                  key={deal.id}
                  href={`/b/${business.slug}`}
                  className="block truncate text-sm font-semibold text-slate-800 hover:text-indigo-700"
                >
                  • {deal.title}
                </Link>
              ))}
            </div>
          ) : null}

          {/* QR — inside the card, like a printed card */}
          <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/qr/${business.slug}?card=1`}
              alt={`QR code for ${business.name}`}
              width={104}
              height={104}
              className="shrink-0 rounded-lg border border-slate-200"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-700">
                Scan to open this card
              </p>
              <a
                href={`/api/qr/${business.slug}?card=1&download=1`}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Download QR →
              </a>
            </div>
          </div>
        </div>
        <div
          className={`flex items-center justify-between px-6 py-2.5 ${
            featured
              ? "bg-gradient-to-r from-amber-500 to-yellow-600"
              : "bg-slate-900"
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-widest text-white/90">
            {featured ? "GoDesi featured card" : "GoDesi digital card"}
          </span>
          <Link
            href={`/b/${business.slug}`}
            className="text-[11px] font-semibold text-white hover:underline"
          >
            Full profile →
          </Link>
        </div>
      </div>

      {/* Primary actions */}
      <div className="grid grid-cols-2 gap-2">
        <a
          href={`/card/${business.slug}/vcf`}
          className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800"
        >
          ⬇️ Save contact
        </a>
        <CardShareButton
          url={cardUrl}
          name={business.name}
          className="flex items-center justify-center gap-2 rounded-2xl border-2 border-indigo-200 bg-white px-4 py-3 text-sm font-bold text-indigo-700 hover:bg-indigo-50"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Link
          href={`/b/${business.slug}`}
          className="flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          🏷️ Services &amp; deals
        </Link>
        <Link
          href={`/card/${business.slug}/poster`}
          className="flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          🖨️ Print shop poster
        </Link>
      </div>

      <ShareButtons
        url={cardUrl}
        title={`${business.name} — ${business.category} digital card`}
      />

      {/* Vendor's referral offer — scissors-style coupon to clip */}
      {business.referralOffer ? (
        <div className="relative mt-7 rounded-2xl border-2 border-dashed border-amber-400 bg-amber-50 px-5 py-4">
          <div className="absolute -top-3 left-4 flex items-center gap-1.5 bg-amber-50 px-2">
            <span aria-hidden>✂️</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">
              Clip this coupon
            </span>
          </div>
          <p className="mt-1 text-center text-base font-extrabold text-slate-900">
            {business.referralOffer}
          </p>
          <p className="mt-1 text-center text-[11px] font-semibold text-amber-700">
            Show this card or mention GoDesi at {business.name} to redeem
          </p>
        </div>
      ) : null}

      {business.description ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            About
          </h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {(paidContact
              ? business.description
              : maskContactDetails(business.description)
            ).slice(0, 600)}
          </p>
        </div>
      ) : null}

      {/* Lead capture */}
      <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-b from-amber-50 to-white p-5 shadow-sm">
        <h2 className="text-center text-base font-bold text-slate-900">
          Share your card with {business.name}
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Leave your details and they&apos;ll get in touch.
        </p>
        <div className="mt-4">
          <CardLeadForm slug={business.slug} />
        </div>
      </div>

      {/* Browse more cards — every trade, one tap */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            🪪 Browse digital cards
          </p>
          <Link
            href={
              business.categorySlug
                ? `/card?cat=${business.categorySlug}`
                : "/card"
            }
            className="text-xs font-bold text-indigo-600 hover:underline"
          >
            More {business.category} cards →
          </Link>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/card?cat=${category.slug}`}
              className={`rounded-full border px-2.5 py-1 text-xs font-semibold hover:bg-slate-50 ${
                category.slug === business.categorySlug
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 text-slate-600"
              }`}
            >
              {category.icon} {category.name}
            </Link>
          ))}
          <Link
            href="/card"
            className="rounded-full border border-slate-300 px-2.5 py-1 text-xs font-bold text-slate-800 hover:bg-slate-50"
          >
            All →
          </Link>
        </div>
      </div>

      {/* Powered-by footer — the viral loop */}
      <div className="rounded-2xl bg-gradient-to-r from-orange-500 via-rose-600 to-fuchsia-600 p-5 text-center text-white shadow-lg">
        <p className="text-sm font-semibold">
          {business.owner
            ? "Want a card like this for your business?"
            : "Is this your business? Claim this card free."}
        </p>
        <Link
          href={business.owner ? "/add-business" : "/claim"}
          className="mt-3 inline-block rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-900 hover:bg-amber-100"
        >
          {business.owner ? "Get your free GoDesi card" : "Claim my card →"}
        </Link>
      </div>
    </div>
  );
}
