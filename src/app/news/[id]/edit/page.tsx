import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { can, getCurrentUser } from "@/lib/auth";
import { newsIdFromParam, newsPath } from "@/lib/newsLinks";
import { ReportForm } from "@/components/forms/ReportForm";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Edit your report",
  robots: { index: false, follow: false },
};

export default async function EditReportPage({
  params,
}: {
  params: { id: string };
}) {
  const id = newsIdFromParam(params.id);
  const [report, user] = await Promise.all([
    db.newsItem.findUnique({ where: { id } }),
    getCurrentUser(),
  ]);
  if (!report || !report.submittedById) notFound();
  if (!user) redirect(`/login?next=/news/${id}/edit`);
  if (report.submittedById !== user.id && !can(user, "news")) notFound();

  const back = newsPath(report);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <Link href={back} className="text-sm text-slate-500 hover:underline">
          ← Back to the story
        </Link>
        <h1 className="mt-2 text-2xl font-black">Edit your report</h1>
        <p className="mt-1 text-sm text-slate-600">
          Fix a typo, add photos or update what happened. The story keeps its
          link and status; readers see the change right away.
        </p>
      </div>
      <Card>
        <ReportForm
          initial={{
            id: report.id,
            title: report.title,
            topic: report.topic,
            city: report.city,
            state: report.state,
            country: report.country,
            happenedAt: report.happenedAt,
            summary: report.summary,
            sourceType: report.sourceType,
            sourceUrl: report.sourceUrl,
            photoUrls: report.photoUrls,
            albumUrl: report.albumUrl,
            videoUrl: report.videoUrl,
          }}
        />
      </Card>
    </div>
  );
}
