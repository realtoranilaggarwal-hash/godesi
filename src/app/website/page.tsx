import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui";
import { SidebarBanners } from "@/components/Banners";
import { CustomWebsiteForm } from "@/components/website/CustomWebsiteForm";
import { WEBSITE_OFFER } from "@/lib/websiteOffer";
import { websitePath } from "@/lib/websiteBuilder";

const NAMESILO_URL = "https://www.namesilo.com/?rid=8ec0177ty";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: `Get your business website — custom built from $${WEBSITE_OFFER.customPriceUsd}`,
  description: `Three steps: book your domain, tell us the pages you want, and our website team builds it. Custom websites from $${WEBSITE_OFFER.customPriceUsd}. Call ${WEBSITE_OFFER.phoneDisplay}.`,
  alternates: { canonical: "/website" },
};

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <Card>
      <div className="text-xs font-bold text-indigo-600">STEP {n}</div>
      <h2 className="text-xl font-black text-slate-900">{title}</h2>
      <div className="mt-2 space-y-3 text-sm text-slate-700">{children}</div>
    </Card>
  );
}

export default async function WebsiteOfferPage({
  searchParams,
}: {
  searchParams: { website?: string; wish?: string };
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
            Get Your Business Website in 3 Simple Steps
          </h1>
          <ol className="mt-3 max-w-2xl list-decimal space-y-1 pl-5 text-lg text-white/90">
            <li>Book your domain, or tell us the one you have.</li>
            <li>Tell us the pages you want and websites you like.</li>
            <li>Our website team builds it. Custom websites start at ${WEBSITE_OFFER.customPriceUsd}.</li>
          </ol>
          <div className="mt-5 flex flex-wrap gap-2">
            <a
              href="#start"
              className="rounded-xl bg-white px-5 py-3 text-base font-bold text-indigo-700 shadow"
            >
              🚀 Start my website
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

        <Step n={1} title="Book your domain first">
          <p>
            Your domain is your website&apos;s address, like <strong>mybusiness.com</strong>. Book
            it at{" "}
            <a
              href={NAMESILO_URL}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="font-semibold text-indigo-700 underline"
            >
              NameSilo
            </a>{" "}
            for about $10–15 a year. Keep it short, match your business name, and pick .com if you
            can.
          </p>
          <p>
            <strong>Already have a domain?</strong> Just type it in Step 2.
          </p>
          <a
            href={NAMESILO_URL}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            className="inline-block rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700"
          >
            Search domains on NameSilo →
          </a>
          <p className="text-xs text-slate-500">
            NameSilo link is a referral link; it costs you nothing extra.
          </p>
        </Step>

        <div id="start" className="scroll-mt-24" />
        <Step n={2} title="Tell us what you want">
          <p>
            Which pages you need (About us, Services, Contact…), what each should say, and websites
            you like the look of. Not sure? Fill in what you can and we&apos;ll call you.
          </p>
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
        </Step>

        <Step n={3} title={`Our team builds it — from $${WEBSITE_OFFER.customPriceUsd}`}>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Our admin team builds your website, working with our partner{" "}
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
              Hosting is ${WEBSITE_OFFER.monthlyUsd}/month or ${WEBSITE_OFFER.yearlyUsd}/year.
            </li>
            <li>
              Your one contact in the USA:{" "}
              <a href={WEBSITE_OFFER.phoneTel} className="font-semibold text-indigo-700 underline">
                {WEBSITE_OFFER.phoneDisplay}
              </a>
              . For anything else, the team takes care of it.
            </li>
          </ul>
          <Link href="/website/examples" className="inline-block font-semibold text-indigo-700 underline">
            See websites the team has built →
          </Link>
        </Step>

        <Card className="border-fuchsia-200 bg-gradient-to-r from-fuchsia-50 to-orange-50">
          <div className="text-xs font-bold text-fuchsia-700">OPTIONAL ADD-ON</div>
          <h2 className="text-xl font-black text-slate-900">
            Daily articles — ${WEBSITE_OFFER.dailyArticlesUsd}/year
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>365 articles, one every day, written for your kind of business.</li>
            <li>Each comes with a picture and hashtags, emailed to you.</li>
            <li>Fresh articles help your website show up on Google.</li>
            <li>Tick the box in Step 2 to add it.</li>
          </ul>
        </Card>
      </div>

      <SidebarBanners />
    </div>
  );
}
