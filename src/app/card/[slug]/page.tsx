import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/format";
import { maskContactDetails } from "@/lib/moderation";
import { effectivePlan } from "@/lib/plans";
import { liveDealWhere } from "@/lib/deals";
import { CardLeadForm } from "@/components/CardLeadForm";
import { CardShareButton } from "@/components/CardShareButton";
import { ShareButtons } from "@/components/ShareButtons";
import { DigitalCardFace } from "@/components/DigitalCardFace";

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
  return (
    <div className="mx-auto max-w-md space-y-5 px-4 py-6">
      {/* The card face — laid out like a printed business card */}
      <DigitalCardFace
        business={business}
        featured={featured}
        paidContact={paidContact}
        extraCategories={extraCategories}
      />

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
                ? `/search?category=${business.categorySlug}`
                : "/search"
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
              href={`/search?category=${category.slug}`}
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
            href="/search"
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
