import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { siteUrl, whatsappLink } from "@/lib/format";
import { maskContactDetails } from "@/lib/moderation";
import { effectivePlan } from "@/lib/plans";
import { CardLeadForm } from "@/components/CardLeadForm";
import { CardShareButton } from "@/components/CardShareButton";

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
      owner: {
        select: { id: true, plan: true, planExpiresAt: true },
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
  const place = [business.city, business.state, business.country]
    .filter(Boolean)
    .join(", ");

  const actions: { emoji: string; label: string; href: string }[] = [];
  if (business.whatsappNumber) {
    actions.push({
      emoji: "💬",
      label: "WhatsApp",
      href: whatsappLink(
        business.whatsappNumber,
        `Hi ${business.name}, I found your card on Godesi.`,
      ),
    });
  }
  if (paidContact && business.phone) {
    actions.push({ emoji: "📞", label: "Call", href: `tel:${business.phone}` });
  }
  if (paidContact && business.publicEmail) {
    actions.push({
      emoji: "✉️",
      label: "Email",
      href: `mailto:${business.publicEmail}`,
    });
  }
  if (business.websiteUrl) {
    actions.push({ emoji: "🌐", label: "Website", href: business.websiteUrl });
  }
  if (business.mapsUrl) {
    actions.push({
      emoji: "📍",
      label: "Directions",
      href: business.mapsUrl,
    });
  }

  return (
    <div className="mx-auto max-w-md space-y-5 px-4 py-6">
      {/* The card */}
      <div className="overflow-hidden rounded-3xl border-2 border-indigo-200 bg-white shadow-lg">
        <div className="bg-gradient-to-r from-orange-500 via-rose-600 to-fuchsia-600 px-6 pb-14 pt-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-white/80">
            GoDesi digital card
          </p>
        </div>
        <div className="-mt-10 flex flex-col items-center px-6 pb-6 text-center">
          {business.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={business.logoUrl}
              alt={business.name}
              className="h-20 w-20 rounded-2xl border-4 border-white bg-white object-cover shadow"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-indigo-100 text-3xl shadow">
              {business.profileType === "PROFESSIONAL" ? "🧑‍💼" : "🏪"}
            </div>
          )}
          <h1 className="mt-3 text-2xl font-extrabold text-slate-900">
            {business.name}
          </h1>
          {business.verifiedProvider ? (
            <span className="mt-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
              ✓ Verified
            </span>
          ) : null}
          <p className="mt-1 text-sm font-medium text-slate-600">
            {business.category}
            {place ? ` · ${place}` : ""}
          </p>

          {actions.length ? (
            <div
              className="mt-4 grid w-full gap-2"
              style={{
                gridTemplateColumns: `repeat(${Math.min(actions.length, 4)}, 1fr)`,
              }}
            >
              {actions.map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  target={action.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    action.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="flex flex-col items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 px-2 py-3 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50"
                >
                  <span className="text-xl">{action.emoji}</span>
                  {action.label}
                </a>
              ))}
            </div>
          ) : null}

          <a
            href={`/card/${business.slug}/vcf`}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white hover:bg-slate-800"
          >
            ⬇️ Save contact
          </a>
          <CardShareButton
            url={cardUrl}
            name={business.name}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-indigo-200 bg-white px-4 py-3 text-sm font-bold text-indigo-700 hover:bg-indigo-50"
          />
        </div>
      </div>

      {business.description ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
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

      {business.specialties.length ? (
        <div className="flex flex-wrap justify-center gap-1.5">
          {business.specialties.slice(0, 8).map((item) => (
            <span
              key={item}
              className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-800"
            >
              {item}
            </span>
          ))}
        </div>
      ) : null}

      {/* QR — print it, scan it, the card opens */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Scan to open this card
        </h2>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/qr/${business.slug}?card=1`}
          alt={`QR code for ${business.name}`}
          width={180}
          height={180}
          className="mx-auto mt-3 rounded-xl border border-slate-200"
        />
        <a
          href={`/api/qr/${business.slug}?card=1&download=1`}
          className="mt-3 inline-block rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Download QR
        </a>
      </div>

      {/* Lead capture */}
      <div className="rounded-3xl border-2 border-amber-200 bg-gradient-to-b from-amber-50 to-white p-5 shadow-sm">
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

      {/* Powered-by footer — the viral loop */}
      <div className="rounded-3xl bg-gradient-to-r from-orange-500 via-rose-600 to-fuchsia-600 p-5 text-center text-white shadow-lg">
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
