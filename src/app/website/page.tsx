import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui";
import { SidebarBanners } from "@/components/Banners";
import { WebsiteStartForm } from "@/components/website/WebsiteStartForm";
import { WEBSITE_OFFER, whatsappOfferLink } from "@/lib/websiteOffer";
import { BASE_INCLUDES, POWER_UPS, WEBSITE_STEPS, websitePath } from "@/lib/websiteBuilder";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Your business already exists online. Let AI turn it into a website.",
  description: `Paste your Google, Yelp or existing website link. AI builds your new website, you preview it free, and pay $${WEBSITE_OFFER.priceUsd} only if you love it.`,
  alternates: { canonical: "/website" },
};

export default async function WebsiteOfferPage() {
  const user = await getCurrentUser();
  const business = user
    ? await db.business.findUnique({
        where: { ownerId: user.id },
        select: { name: true, city: true, phone: true, websiteUrl: true },
      })
    : null;
  const whatsapp = whatsappOfferLink();

  const recentIds = (cookies().get("godesi_web_projects")?.value ?? "")
    .split(",")
    .filter(Boolean)
    .slice(0, 3);
  const recent = recentIds.length
    ? await db.websiteProject.findMany({
        where: { id: { in: recentIds }, status: { notIn: ["CANCELLED"] } },
        select: { id: true, businessName: true, status: true },
        orderBy: { updatedAt: "desc" },
      })
    : [];

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-5">
        <section className="rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-5 py-8 text-white sm:px-8">
          <h1 className="text-3xl font-black leading-tight sm:text-4xl">
            Your Business Already Exists Online.
            <br />
            Let AI Turn It Into A Website.
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-white/90">
            Give us your Google, Yelp or existing website. AI builds your new website.{" "}
            <strong>Preview it FREE.</strong> Love it? Pay and launch. Don&apos;t like it?
            You don&apos;t pay.
          </p>
          <p className="mt-2 max-w-2xl text-sm text-white/80">
            Then add the tools you need — booking, AI chat, payments, CRM, lead capture and
            more. ${WEBSITE_OFFER.priceUsd} once, ${WEBSITE_OFFER.monthlyUsd}/month hosting, Power-Ups from $
            {Math.min(...POWER_UPS.map((p) => p.monthlyUsd))}/month.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <a
              href="#start"
              className="rounded-xl bg-white px-5 py-3 text-base font-bold text-indigo-700 shadow"
            >
              🚀 Build My Website FREE
            </a>
            {whatsapp ? (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white"
              >
                💬 Ask on WhatsApp
              </a>
            ) : null}
          </div>
        </section>

        {recent.length ? (
          <Card>
            <h2 className="text-base font-bold">Pick up where you left off</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {recent.map((project) => (
                <li key={project.id}>
                  <Link
                    href={websitePath(
                      project.id,
                      project.status === "APPROVED"
                        ? "/features"
                        : project.status === "PAID" || project.status === "LIVE"
                          ? "/done"
                          : project.status === "PREVIEW"
                            ? "/preview"
                            : "/verify",
                    )}
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

        <Card>
          <ol className="grid gap-3 text-sm sm:grid-cols-5">
            {WEBSITE_STEPS.map((step, index) => (
              <li key={step} className="rounded-xl bg-slate-50 p-3">
                <div className="text-xs font-bold text-indigo-600">STEP {index + 1}</div>
                <div className="font-semibold text-slate-900">{step}</div>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-slate-500">
            Every website includes: {BASE_INCLUDES.join(", ").toLowerCase()}. Built and hosted
            by GoDesi with our partner{" "}
            <a href={WEBSITE_OFFER.partnerUrl} target="_blank" rel="noopener noreferrer nofollow" className="underline">
              {WEBSITE_OFFER.partner}
            </a>
            .
          </p>
        </Card>

        <Card>
          <div id="start" className="scroll-mt-24" />
          <WebsiteStartForm
            defaults={{
              businessName: business?.name,
              city: business?.city ?? user?.location ?? undefined,
              phone: business?.phone ?? undefined,
              email: user?.email,
              website: business?.websiteUrl ?? undefined,
            }}
          />
        </Card>
      </div>

      <SidebarBanners />
    </div>
  );
}
