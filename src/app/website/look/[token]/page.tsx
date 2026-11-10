import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card } from "@/components/ui";
import { LookActions } from "@/components/website/LookActions";
import { websitePath } from "@/lib/websiteBuilder";
import { WEBSITE_OFFER } from "@/lib/websiteOffer";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Your new website",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

/**
 * The private link a custom-design customer gets. The design is shown framed
 * inside GoDesi so its own address is not on the page or in the email.
 */
export default async function LookPage({ params }: { params: { token: string } }) {
  const project = await db.websiteProject.findUnique({
    where: { previewToken: params.token },
    select: { id: true, businessName: true, designUrl: true, status: true },
  });
  if (!project?.designUrl || project.status === "CANCELLED") notFound();
  const paid = project.status === "PAID" || project.status === "LIVE";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">Your new website</p>
          <h1 className="text-2xl font-black text-slate-900">{project.businessName}</h1>
          <p className="text-sm text-slate-600">
            Scroll inside the window to see every page. Tap the menu to move between pages.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <iframe
          src={project.designUrl}
          title={`${project.businessName} — website preview`}
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          className="h-[75vh] min-h-[480px] w-full"
        />
      </div>

      {paid ? (
        <Card>
          <p className="text-sm text-slate-700">
            This website is paid for.{" "}
            <Link href={websitePath(project.id, "/done")} className="font-semibold text-indigo-700 underline">
              Go to your website page
            </Link>{" "}
            to see its address or ask for a change.
          </p>
        </Card>
      ) : (
        <LookActions
          token={params.token}
          priceLine={`$${WEBSITE_OFFER.customPriceUsd} once, then hosting $${WEBSITE_OFFER.monthlyUsd}/month or $${WEBSITE_OFFER.yearlyUsd}/year — includes ${WEBSITE_OFFER.changesPerMonth} change a month (${WEBSITE_OFFER.changesPerYear} a year). You only pay if you love it.`}
        />
      )}
    </div>
  );
}
