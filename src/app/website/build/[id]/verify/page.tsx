import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui";
import { StepHeader } from "@/components/website/StepHeader";
import { VerifyFactsForm } from "@/components/website/VerifyFactsForm";
import { loadProject, projectFound, projectSources } from "@/lib/websiteProjects";
import { WEBSITE_SOURCES } from "@/lib/websiteBuilder";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Check the facts", robots: { index: false } };

export default async function VerifyPage({ params }: { params: { id: string } }) {
  const project = await loadProject(params.id);
  if (!project) notFound();
  const found = projectFound(project);
  const sources = projectSources(project);
  const read = WEBSITE_SOURCES.filter((source) => found?.from.includes(source.key));
  const linked = WEBSITE_SOURCES.filter((source) => sources[source.key]);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <StepHeader
        step={2}
        title={`Is this ${project.businessName}?`}
        lead={
          read.length
            ? `We read your ${read.map((s) => s.label.split(" /")[0]).join(", ")} page${read.length > 1 ? "s" : ""}. Fix anything that's off — this is what goes on the site.`
            : linked.length
              ? "We couldn't read the pages you linked (some sites block robots) — please check the details below and we'll build from them."
              : "No links given, so we'll build from what you typed. Add a line about the business if you can."
        }
      />
      <Card>
        <VerifyFactsForm
          id={project.id}
          project={{
            businessName: project.businessName,
            phone: project.phone,
            email: project.email,
            whatsapp: project.whatsapp,
            address: project.address,
          }}
          found={found}
        />
      </Card>
    </div>
  );
}
