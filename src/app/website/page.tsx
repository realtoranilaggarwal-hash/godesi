import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui";
import { WebsiteRequestForm } from "@/components/forms/WebsiteRequestForm";
import { SidebarBanners } from "@/components/Banners";
import { WEBSITE_OFFER, WEBSITE_OFFER_INCLUDES } from "@/lib/websiteOffer";

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
            . ${WEBSITE_OFFER.priceUsd} to build it, then ${WEBSITE_OFFER.monthlyUsd} a
            month — domain and hosting included. Fill the form below and we reply
            within one business day.
          </p>
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
            ${WEBSITE_OFFER.priceUsd} one-time build, then ${WEBSITE_OFFER.monthlyUsd} a
            month covering your domain, hosting and small text or photo updates. Extra
            pages, online payments or a booking system are quoted separately.
          </p>
        </Card>

        <Card>
          <h2 className="text-lg font-bold">Tell us about your website</h2>
          <p className="mb-4 text-sm text-slate-600">
            Everything here goes straight to our team — nothing is published on Godesi.
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
