import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCategory } from "@/lib/directory";
import { LeadForm } from "@/components/forms/LeadForm";
import { Card } from "@/components/ui";
import { PostingSidebar } from "@/components/PostingSidebar";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Post a requirement" };

export default async function NewLeadPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/signup?role=CLIENT");

  const category = searchParams.category
    ? await getCategory(searchParams.category)
    : null;

  return (
    <div className="flex justify-center gap-6">
      <div className="min-w-0 max-w-2xl flex-1 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Post your requirement</h1>
          <p className="text-sm text-slate-600">
            Businesses see your requirement instantly. Only Premium members can
            view your contact details.
          </p>
        </div>
        <Card>
          <LeadForm
            defaultName={user.name}
            defaultEmail={user.email}
            defaultCategory={category?.name}
          />
        </Card>
      </div>

      <PostingSidebar />
    </div>
  );
}
