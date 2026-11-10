import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { StepHeader } from "@/components/website/StepHeader";
import { FeaturesCart } from "@/components/website/FeaturesCart";
import {
  hostingTerm,
  loadPowerUps,
  loadProject,
  previewHref,
  projectQuoted,
} from "@/lib/websiteProjects";
import { setupUsdFor, suggestedPowerUps, websitePath } from "@/lib/websiteBuilder";
import { WEBSITE_OFFER } from "@/lib/websiteOffer";
import { stripeEnabled } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Features & launch", robots: { index: false } };

export default async function FeaturesPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { cancelled?: string };
}) {
  const project = await loadProject(params.id);
  if (!project) notFound();
  if (project.status === "PAID" || project.status === "LIVE") redirect(websitePath(project.id, "/done"));
  if (!project.approvedAt) {
    if (project.tier === "CUSTOM") redirect(previewHref(project) ?? "/website/custom?sent=1");
    redirect(websitePath(project.id, "/preview"));
  }

  const powerUps = (await loadPowerUps()).filter((powerUp) => powerUp.active);
  const preview = previewHref(project);
  const custom = project.tier === "CUSTOM";

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <StepHeader
        step={5}
        title="Make your website work harder"
        lead="Here is your price, the tools you can add, and one button to launch."
      />
      <FeaturesCart
        id={project.id}
        powerUps={powerUps}
        selected={project.powerUps}
        quoted={projectQuoted(project)}
        suggested={suggestedPowerUps(project.goals)}
        stripeReady={stripeEnabled()}
        cancelled={searchParams.cancelled === "1"}
        setupUsd={setupUsdFor(project.tier)}
        setupLabel={
          custom
            ? `Custom designed website — up to ${WEBSITE_OFFER.customPages} pages, designed for you`
            : "AI website — design, copy, photos, launch"
        }
        billing={hostingTerm(project)}
      />
      <p className="text-center text-xs text-slate-500">
        {preview ? (
          <>
            Changed your mind about the look?{" "}
            <Link href={preview} target="_blank" className="underline">
              See the approved preview
            </Link>
            .
          </>
        ) : null} Payments are handled by Stripe; hosting can be cancelled any time.
      </p>
    </div>
  );
}
