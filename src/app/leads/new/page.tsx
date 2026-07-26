import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LeadForm } from "@/components/forms/LeadForm";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Post a requirement" };

export default async function NewLeadPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signup?role=CLIENT");

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Post your requirement</h1>
        <p className="text-sm text-slate-600">
          Businesses see your requirement instantly. Only Premium members can view your
          contact details.
        </p>
      </div>
      <Card>
        <LeadForm defaultName={user.name} defaultEmail={user.email} />
      </Card>
    </div>
  );
}
