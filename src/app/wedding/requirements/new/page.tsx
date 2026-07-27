import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { weddingServiceName } from "@/lib/wedding";
import { WeddingRequirementForm } from "@/components/forms/WeddingRequirementForm";
import { PostingSidebar } from "@/components/PostingSidebar";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Post your wedding requirement — get vendor quotes",
  description:
    "Brides, grooms and families: tick the wedding services you need, add your city, date and budget, and desi wedding vendors will reach out on WhatsApp.",
  alternates: { canonical: "/wedding/requirements/new" },
};

export default async function NewWeddingRequirementPage({
  searchParams,
}: {
  searchParams: { service?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/signup?role=CLIENT&next=/wedding/requirements/new");

  return (
    <div className="flex justify-center gap-6">
      <div className="min-w-0 max-w-2xl flex-1 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Post your wedding requirement 💍</h1>
          <p className="text-sm text-slate-600">
            Tell vendors what you need and they will come to you. Your phone number
            stays hidden — only Premium vendors can unlock it, and they reply on
            WhatsApp.
          </p>
        </div>

        <Card>
          <WeddingRequirementForm
            defaultName={user.name}
            defaultEmail={user.email}
            defaultService={
              searchParams.service ? weddingServiceName(searchParams.service) : undefined
            }
          />
        </Card>
      </div>

      <PostingSidebar />
    </div>
  );
}
