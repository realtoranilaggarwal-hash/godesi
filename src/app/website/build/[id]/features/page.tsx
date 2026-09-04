import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { StepHeader } from "@/components/website/StepHeader";
import { FeaturesCart } from "@/components/website/FeaturesCart";
import { loadPowerUps, loadProject, projectQuoted } from "@/lib/websiteProjects";
import { suggestedPowerUps, websitePath } from "@/lib/websiteBuilder";
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
  if (!project.approvedAt) redirect(websitePath(project.id, "/preview"));

  const powerUps = (await loadPowerUps()).filter((powerUp) => powerUp.active);

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
      />
      <p className="text-center text-xs text-slate-500">
        Changed your mind about the look?{" "}
        <Link href={websitePath(project.id, "/site")} target="_blank" className="underline">
          See the approved preview
        </Link>
        . Payments are handled by Stripe; the monthly part can be cancelled any time.
      </p>
    </div>
  );
}
