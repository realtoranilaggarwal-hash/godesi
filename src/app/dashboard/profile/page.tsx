import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { BusinessProfileForm } from "@/components/forms/BusinessProfileForm";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit business profile" };

export default async function ProfileEditorPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const business = await db.business.findUnique({ where: { ownerId: user.id } });

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">
        {business ? "Edit your digital card" : "Create your digital card"}
      </h1>
      <Card>
        <BusinessProfileForm business={business} />
      </Card>
    </div>
  );
}
