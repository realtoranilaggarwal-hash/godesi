import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui";
import { JobForm } from "@/components/forms/JobForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Post a job", robots: { index: false } };

export default async function NewJobPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/jobs/new");

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">💼 Post a job</h1>
        <p className="text-sm text-slate-600">
          Free. Signed-in members see it on godesi.com/jobs and apply here; you get
          each application by email and under My jobs.
        </p>
      </div>
      <Card>
        <JobForm />
      </Card>
    </div>
  );
}
