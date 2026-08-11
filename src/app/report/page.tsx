import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { PLATFORM_DISCLAIMER } from "@/lib/safety";
import { ReportIssueForm } from "@/components/forms/ReportIssueForm";
import { SidebarBanners } from "@/components/Banners";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Report an issue — fake listings, fraud or unsafe content",
  description:
    "Report a fake listing, fraud, poor service, a fake review or unsafe content on Godesi. Our team reviews every report and may warn, suspend or remove accounts.",
  alternates: { canonical: "/report" },
};

export default async function ReportPage({
  searchParams,
}: {
  searchParams: { about?: string };
}) {
  const user = await getCurrentUser();

  return (
    <div className="flex justify-center gap-6">
      <div className="min-w-0 max-w-2xl flex-1 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Report an issue</h1>
          <p className="text-sm text-slate-600">
            Tell us what happened and we will look into it. Reports are confidential —
            we never share your details with the person you are reporting.
          </p>
        </div>

        <Card>
          <ReportIssueForm
            defaultName={user?.name}
            defaultEmail={user?.email}
            defaultSubject={searchParams.about}
          />
        </Card>

        <Card className="text-xs leading-relaxed text-slate-600">
          <p className="text-sm font-bold text-slate-800">Please note</p>
          <p className="mt-1">{PLATFORM_DISCLAIMER}</p>
          <p className="mt-2">
            Hiring someone soon? Read{" "}
            <Link href="/safety" className="font-semibold text-indigo-600">
              how to hire safely
            </Link>{" "}
            first.
          </p>
        </Card>
      </div>

      <SidebarBanners />
    </div>
  );
}
