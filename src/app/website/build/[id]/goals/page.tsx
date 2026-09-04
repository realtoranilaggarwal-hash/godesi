import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui";
import { StepHeader } from "@/components/website/StepHeader";
import { GoalsForm } from "@/components/website/GoalsForm";
import { loadProject } from "@/lib/websiteProjects";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "What should your website do?", robots: { index: false } };

export default async function GoalsPage({ params }: { params: { id: string } }) {
  const project = await loadProject(params.id);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <StepHeader
        step={3}
        title="What do you want your website to do?"
        lead="Add any pictures you have, then tick what customers should be able to do. AI builds the first version from this — free, no card."
      />
      <Card>
        <GoalsForm
          id={project.id}
          goals={project.goals}
          wish={project.wish}
          uploads={project.uploads}
          hasContent={Boolean(project.content)}
        />
      </Card>
    </div>
  );
}
