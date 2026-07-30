import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui";
import { WebsiteRequestForm } from "@/components/forms/WebsiteRequestForm";
import { SidebarBanners } from "@/components/Banners";
import {
  WEBSITE_OFFER,
  WEBSITE_OFFER_INCLUDES,
  whatsappOfferLink,
} from "@/lib/websiteOffer";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: `Get a ${WEBSITE_OFFER.pages}-page website for $${WEBSITE_OFFER.priceUsd}`,
  description: `No website yet? Godesi builds desi businesses a ${WEBSITE_OFFER.pages}-page mobile-friendly website for $${WEBSITE_OFFER.priceUsd} in collaboration with ${WEBSITE_OFFER.partner}.`,
  alternates: { canonical: "/website" },
};

export default async function WebsiteOfferPage() {
  const user = await getCurrentUser();
  const business = user
    ? await db.business.findUnique({
        where: { ownerId: user.id },
        select: { name: true, city: true, phone: true },
      })
    : null;
  const whatsapp = whatsappOfferLink(
    `Hi Godesi, I would like the $${WEBSITE_OFFER.priceUsd} website for my business.`,
  );

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-5">
        <section className="rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-5 py-7 text-white sm:px-8">
          <h1 className="text-3xl font-black">
            No website? Get one for ${WEBSITE_OFFER.priceUsd} 🌐
          </h1>
          <p className="mt-2 max-w-2xl text-white/90">
            A clean {WEBSITE_OFFER.pages}-page website for your business, built with
            our partner{" "}
            <a
              href={WEBSITE_OFFER.partnerUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="font-semibold underline"
            >
              {WEBSITE_OFFER.partner}
            </a>
            . One-time ${WEBSITE_OFFER.priceUsd} — no monthly fee to us. Fill the form
            below and we reply within one business day.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
            <a
              href={`mailto:${WEBSITE_OFFER.email}?subject=${encodeURIComponent(
                `$${WEBSITE_OFFER.priceUsd} website enquiry`,
              )}`}
              className="rounded-xl bg-white px-4 py-2 text-indigo-700"
            >
              ✉️ {WEBSITE_OFFER.email}
            </a>
            {whatsapp ? (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-emerald-500 px-4 py-2 text-white"
              >
                💬 Ask on WhatsApp
              </a>
            ) : null}
          </div>
        </section>

        <Card>
          <h2 className="text-lg font-bold">What ${WEBSITE_OFFER.priceUsd} covers</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {WEBSITE_OFFER_INCLUDES.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden>✅</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">
            Domain and hosting are billed by the provider, usually $10–$30 a year, and
            stay in your name. Extra pages, online payments or a booking system are
            quoted separately.
          </p>
        </Card>

        <Card>
          <h2 className="text-lg font-bold">Tell us about your website</h2>
          <p className="mb-4 text-sm text-slate-600">
            Everything here goes straight to the Godesi desk at{" "}
            {WEBSITE_OFFER.email}. Nothing is published on Godesi.
          </p>
          <WebsiteRequestForm
            defaultBusinessName={business?.name}
            defaultCity={business?.city ?? user?.location ?? undefined}
            defaultEmail={user?.email}
            defaultPhone={business?.phone ?? undefined}
          />
        </Card>
      </div>

      <SidebarBanners />
    </div>
  );
}
