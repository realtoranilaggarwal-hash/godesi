import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getCategoryTree } from "@/lib/directory";
import { BusinessProfileForm } from "@/components/forms/BusinessProfileForm";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit business profile" };

export default async function ProfileEditorPage({
  searchParams,
}: {
  searchParams: { category?: string; subcategory?: string; type?: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    const query = new URLSearchParams(
      Object.entries(searchParams).filter((entry): entry is [string, string] =>
        Boolean(entry[1]),
      ),
    ).toString();
    redirect(
      `/login?next=${encodeURIComponent(`/dashboard/profile${query ? `?${query}` : ""}`)}`,
    );
  }

  const [business, categories] = await Promise.all([
    db.business.findUnique({ where: { ownerId: user.id } }),
    getCategoryTree(),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">
        {business ? "Edit your digital card" : "Create your digital card"}
      </h1>
      <Card>
        <BusinessProfileForm
          business={business}
          categories={categories}
          defaultCategory={searchParams.category}
          defaultSubcategory={searchParams.subcategory}
          defaultProfileType={
            searchParams.type === "professional" ? "PROFESSIONAL" : "BUSINESS"
          }
        />
      </Card>
    </div>
  );
}
