import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui";
import { SidebarBanners } from "@/components/Banners";
import { CustomWebsiteForm } from "@/components/website/CustomWebsiteForm";
import { WEBSITE_CONTENT_PACKAGE, WEBSITE_OFFER } from "@/lib/websiteOffer";
import { MarketingShopCard } from "@/components/MarketingShopCard";
import { WebsiteContentPackage } from "@/components/website/WebsiteContentPackage";
import { websitePath } from "@/lib/websiteBuilder";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: `Get your business website — custom built for $${WEBSITE_OFFER.customPriceUsd}`,
  description: `Tell us your domain, the pages you want, your photos and videos, and our website team builds it. Custom websites for $${WEBSITE_OFFER.customPriceUsd} with an AI chat bot, hosting $${WEBSITE_OFFER.customHostingYearUsd}/year. Call ${WEBSITE_OFFER.phoneDisplay}.`,
  alternates: { canonical: "/website" },
};

export default async function WebsiteOfferPage({
  searchParams,
}: {
  searchParams: { website?: string; wish?: string; add?: string; package?: string };
}) {
  const user = await getCurrentUser();
  const business = user
    ? await db.business.findUnique({
        where: { ownerId: user.id },
        select: { name: true, city: true, phone: true, websiteUrl: true },
      })
    : null;

  const recentIds = (cookies().get("godesi_web_projects")?.value ?? "")
    .split(",")
    .filter(Boolean)
    .slice(0, 3);
  const recent = recentIds.length
    ? await db.websiteProject.findMany({
        where: { id: { in: recentIds }, status: { notIn: ["CANCELLED"] } },
        select: { id: true, businessName: true, status: true, tier: true, previewToken: true },
        orderBy: { updatedAt: "desc" },
      })
    : [];

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-5">
        <section className="rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-5 py-8 text-white sm:px-8">
          <h1 className="text-3xl font-black leading-tight sm:text-4xl">
            Tell us about your website
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-white/90">
            Answer a few quick questions: your domain, the pages you want, your
            photos and videos. Our team builds your custom website with an AI
            chat bot, photo and video galleries. Hosting is $
            {WEBSITE_OFFER.customHostingYearUsd} a year.
          </p>
          <p className="mt-3 text-2xl font-black">
            <s className="mr-2 text-lg font-bold text-white/60">
              ${WEBSITE_OFFER.customListPriceUsd}
            </s>
            ${WEBSITE_OFFER.customPriceUsd}{" "}
            <span className="rounded-full bg-amber-300 px-2 py-0.5 align-middle text-xs font-bold text-amber-950">
              Limited-time price
            </span>
          </p>
          <p className="mt-2 max-w-2xl text-sm font-semibold text-amber-200">
            🎁 Use code {WEBSITE_OFFER.giftCode} and get a free featured ad on
            GoDesi for 1 year. Refer {WEBSITE_OFFER.referralFriends} friends and
            your first year of hosting is free.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <a
              href="#start"
              className="rounded-xl bg-white px-5 py-3 text-base font-bold text-indigo-700 shadow"
            >
              🚀 Get started
            </a>
            <a
              href="#package"
              className="rounded-xl bg-amber-300 px-4 py-3 text-sm font-bold text-amber-950"
            >
              🎁 ${WEBSITE_CONTENT_PACKAGE.priceUsd} website + content package
            </a>
            <a
              href={WEBSITE_OFFER.phoneTel}
              className="rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white"
            >
              📞 Call {WEBSITE_OFFER.phoneDisplay}
            </a>
          </div>
        </section>

        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <strong>Our ${WEBSITE_OFFER.priceUsd} AI website plan is full right now.</strong> We are
          only taking custom-built websites, from ${WEBSITE_OFFER.customPriceUsd}.
        </p>

        <WebsiteContentPackage />

        <MarketingShopCard />

        {recent.length ? (
          <Card>
            <h2 className="text-base font-bold">Pick up where you left off</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {recent.map((project) => (
                <li key={project.id}>
                  <Link
                    href={
                      project.status === "APPROVED"
                        ? websitePath(project.id, "/features")
                        : project.status === "PAID" || project.status === "LIVE"
                          ? websitePath(project.id, "/done")
                          : project.tier === "CUSTOM"
                            ? project.previewToken
                              ? `/website/look/${project.previewToken}`
                              : "/website/custom?sent=1"
                            : websitePath(project.id, project.status === "PREVIEW" ? "/preview" : "/verify")
                    }
                    className="font-semibold text-indigo-700 hover:underline"
                  >
                    {project.businessName}
                  </Link>{" "}
                  <span className="text-slate-500">— {project.status.toLowerCase()}</span>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        <div id="start" className="scroll-mt-24" />
        <CustomWebsiteForm
          defaults={{
            businessName: business?.name,
            city: business?.city ?? user?.location ?? undefined,
            phone: business?.phone ?? undefined,
            email: user?.email,
            website: searchParams.website ?? business?.websiteUrl ?? undefined,
            wish: searchParams.wish ?? (searchParams.package === "content" ? WEBSITE_CONTENT_PACKAGE.wish : undefined),
            articles: searchParams.add === "articles",
            ordering: searchParams.add === "ordering",
            contentPackage: searchParams.package === "content",
          }}
        />

        <Card>
          <h2 className="text-xl font-black text-slate-900">Who builds your website</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>
              Our admin team builds it, working with our partner{" "}
              <a
                href={WEBSITE_OFFER.partnerUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="underline"
              >
                {WEBSITE_OFFER.partner}
              </a>
              . The team has built many websites.
            </li>
            <li>You get a private preview first and pay only if you love it.</li>
            <li>
              Your one contact in the USA:{" "}
              <a href={WEBSITE_OFFER.phoneTel} className="font-semibold text-indigo-700 underline">
                {WEBSITE_OFFER.phoneDisplay}
              </a>
              . For anything else, the team takes care of it.
            </li>
          </ul>
          <Link href="/website/examples" className="mt-2 inline-block text-sm font-semibold text-indigo-700 underline">
            See websites the team has built →
          </Link>
        </Card>
      </div>

      <SidebarBanners />
    </div>
  );
}
