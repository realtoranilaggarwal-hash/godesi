import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui";
import { CustomWebsiteForm } from "@/components/website/CustomWebsiteForm";
import { WEBSITE_OFFER } from "@/lib/websiteOffer";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: `Custom designed website — $${WEBSITE_OFFER.customPriceUsd}`,
  description: `Send us your old website, Google, Yelp or Zillow profile and up to ${WEBSITE_OFFER.customPages} pages of content. Our designer builds your new website; you see it free and pay only if you love it.`,
};

export default async function CustomWebsitePage({
  searchParams,
}: {
  searchParams: { plan?: string; website?: string; wish?: string; sent?: string };
}) {
  // The upgrade page's website box posts here for both options.
  if (searchParams.plan === "ai") {
    const query = new URLSearchParams();
    if (searchParams.website) query.set("website", searchParams.website);
    if (searchParams.wish) query.set("wish", searchParams.wish);
    redirect(`/website${query.size ? `?${query}` : ""}#start`);
  }

  if (searchParams.sent) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Card className="border-emerald-200 bg-emerald-50">
          <h1 className="text-2xl font-black text-slate-900">🎨 Request received</h1>
          <p className="mt-2 text-sm text-slate-700">
            Our designer is on it. We&apos;ll email you a private link to see your new website —
            usually within 3–5 business days. You only pay ${WEBSITE_OFFER.customPriceUsd} if you
            love it, and you can ask for changes first.
          </p>
          <p className="mt-2 text-sm text-slate-700">
            Questions? <a href={`mailto:${WEBSITE_OFFER.email}`} className="underline">{WEBSITE_OFFER.email}</a>
          </p>
        </Card>
      </div>
    );
  }

  const user = await getCurrentUser();
  const business = user
    ? await db.business.findUnique({
        where: { ownerId: user.id },
        select: { name: true, city: true, phone: true, websiteUrl: true },
      })
    : null;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <section className="rounded-3xl bg-gradient-to-r from-fuchsia-600 via-rose-600 to-orange-500 px-5 py-8 text-white sm:px-8">
        <p className="text-sm font-bold uppercase tracking-wide text-white/80">Custom designed website</p>
        <h1 className="mt-1 text-3xl font-black leading-tight sm:text-4xl">
          A designer builds your new website — ${WEBSITE_OFFER.customPriceUsd}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-white/90">
          Send us your old website, Google, Yelp or Zillow profile, sites you like and up to{" "}
          {WEBSITE_OFFER.customPages} pages of content. We redesign it and send you a private
          preview. <strong>Pay only if you love it.</strong>
        </p>
        <p className="mt-2 max-w-2xl text-sm text-white/80">
          Then hosting is ${WEBSITE_OFFER.monthlyUsd}/month or ${WEBSITE_OFFER.yearlyUsd}/year, and
          includes {WEBSITE_OFFER.changesPerMonth} change a month ({WEBSITE_OFFER.changesPerYear} a
          year).
        </p>
      </section>

      <Card>
        <CustomWebsiteForm
          defaults={{
            businessName: business?.name,
            city: business?.city ?? user?.location ?? undefined,
            phone: business?.phone ?? undefined,
            email: user?.email,
            website: searchParams.website ?? business?.websiteUrl ?? undefined,
            wish: searchParams.wish,
          }}
        />
      </Card>

      <p className="text-center text-sm text-slate-600">
        Want it faster and cheaper?{" "}
        <Link href="/website" className="font-semibold text-indigo-700 underline">
          Let AI build it for ${WEBSITE_OFFER.priceUsd}
        </Link>
      </p>
    </div>
  );
}
