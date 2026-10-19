import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { Card } from "@/components/ui";
import { JobForm } from "@/components/forms/JobForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit job", robots: { index: false } };

export default async function EditJobPage({ params }: { params: { slug: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/jobs/${params.slug}/edit`);
  const job = await db.job.findUnique({ where: { slug: params.slug } });
  if (!job) notFound();
  if (job.posterId !== user.id && !isStaff(user)) redirect(`/jobs/${job.slug}`);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Edit job</h1>
      <Card>
        <JobForm job={job} />
      </Card>
    </div>
  );
}
