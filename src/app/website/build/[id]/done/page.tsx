import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Card } from "@/components/ui";
import { QuoraEvent } from "@/components/QuoraEvent";
import { StepHeader } from "@/components/website/StepHeader";
import { loadProject } from "@/lib/websiteProjects";
import { websitePath } from "@/lib/websiteBuilder";
import { WEBSITE_OFFER } from "@/lib/websiteOffer";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Website ordered", robots: { index: false } };

export default async function DonePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { session?: string };
}) {
  const project = await loadProject(params.id);
  if (!project) notFound();
  const paid = project.status === "PAID" || project.status === "LIVE";
  if (!paid && !searchParams.session) redirect(websitePath(project.id, "/features"));

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {searchParams.session ? (
        <QuoraEvent
          event="Purchase"
          valueUsd={
            project.setupMinor ? project.setupMinor / 100 : WEBSITE_OFFER.priceUsd
          }
        />
      ) : null}
      <StepHeader
        step={5}
        title={project.status === "LIVE" ? "🌐 Your website is live" : paid ? "🚀 Launching your website" : "Thanks — confirming your payment"}
      />
      <Card>
        {project.status === "LIVE" && project.liveUrl ? (
          <p>
            <a href={project.liveUrl} className="text-lg font-bold text-indigo-700 underline" target="_blank" rel="noopener noreferrer">
              {project.liveUrl}
            </a>
          </p>
        ) : paid ? (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              Payment received for <strong>{project.businessName}</strong>. Our team now puts your
              approved design on its domain, switches on the features you picked, and emails
              you the address — usually within two business days.
            </p>
            <p>
              Questions? <a href={`mailto:${WEBSITE_OFFER.email}`} className="underline">{WEBSITE_OFFER.email}</a>
            </p>
          </div>
        ) : (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              Stripe is telling us about your payment — this page updates in a few seconds.
              If it doesn&apos;t, refresh, or email{" "}
              <a href={`mailto:${WEBSITE_OFFER.email}`} className="underline">{WEBSITE_OFFER.email}</a>{" "}
              with your business name.
            </p>
            <meta httpEquiv="refresh" content="6" />
          </div>
        )}
        <p className="mt-4 text-xs text-slate-500">
          <Link href={websitePath(project.id, "/site")} target="_blank" className="underline">
            View the approved preview
          </Link>
        </p>
      </Card>
    </div>
  );
}
