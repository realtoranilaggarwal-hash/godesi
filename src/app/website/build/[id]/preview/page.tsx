import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { StepHeader } from "@/components/website/StepHeader";
import { PreviewActions } from "@/components/website/PreviewActions";
import { PreviewFrame } from "@/components/website/PreviewFrame";
import { loadProject, projectContent, projectFound, projectPhotos } from "@/lib/websiteProjects";
import { designFor, websitePath } from "@/lib/websiteBuilder";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your website preview", robots: { index: false } };

export default async function PreviewPage({ params }: { params: { id: string } }) {
  const project = await loadProject(params.id);
  if (!project) notFound();
  const content = projectContent(project);
  if (!content) redirect(websitePath(project.id, "/goals"));
  if (project.status === "APPROVED") redirect(websitePath(project.id, "/features"));
  if (project.status === "PAID" || project.status === "LIVE") redirect(websitePath(project.id, "/done"));

  const design = designFor(project.designSeed);
  const found = projectFound(project);
  const photos = projectPhotos(project);
  const checks = [
    ["Business information", true],
    ["Services", content.services.length > 0],
    ["Photos", photos.length > 0],
    ["Reviews", Boolean(found?.reviews?.length || found?.rating)],
    ["Website design", true],
    ["Mobile version", true],
    ["SEO basics", Boolean(content.seoTitle)],
  ] as const;

  return (
    <div className="space-y-5">
      <StepHeader
        step={4}
        title="🎉 Your website preview is ready!"
        lead={`${project.businessName} — "${design.palette.name}" look, ${design.font.name.toLowerCase()} type. Nothing to pay yet.`}
      />

      <ul className="flex flex-wrap gap-1.5 text-xs">
        {checks.map(([label, ok]) => (
          <li
            key={label}
            className={`rounded-full px-2.5 py-1 font-medium ${
              ok ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
            }`}
          >
            {ok ? "✓" : "–"} {label}
          </li>
        ))}
        {!photos.length ? (
          <li>
            <Link href={websitePath(project.id, "/goals")} className="text-xs text-indigo-700 underline">
              Add photos
            </Link>
          </li>
        ) : null}
      </ul>

      <PreviewFrame src={websitePath(project.id, "/site")} seed={project.designSeed} />

      <PreviewActions id={project.id} changeNotes={project.changeNotes} />

      <p className="text-center text-xs text-slate-500">
        Want different words or services?{" "}
        <Link href={websitePath(project.id, "/goals")} className="underline">
          Change what the site should do
        </Link>{" "}
        · Facts wrong?{" "}
        <Link href={websitePath(project.id, "/verify")} className="underline">
          Fix the business details
        </Link>
      </p>
    </div>
  );
}
