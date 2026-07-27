import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getCategoryTree } from "@/lib/directory";
import { BusinessProfileForm } from "@/components/forms/BusinessProfileForm";
import { isAgentCard } from "@/lib/agents";
import { Card, LinkButton } from "@/components/ui";
import { PostingSidebar } from "@/components/PostingSidebar";
import { ListingHelp } from "@/components/ListingHelp";
import { effectivePlan } from "@/lib/plans";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Edit your Godesi business card",
  description:
    "Update your Godesi digital business card: category, city, WhatsApp, photos, video, packages, starting price and every social profile you have.",
  robots: { index: false },
};

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
    <div className="flex justify-center gap-6">
      <div className="min-w-0 max-w-3xl flex-1 space-y-4">
        <h1 className="text-2xl font-bold">
          {business ? "Edit your digital card" : "Create your digital card"}
        </h1>
        {isAgentCard(business?.subcategorySlug ?? null) ||
        searchParams.subcategory === "real-estate-property-dealers" ||
        searchParams.subcategory === "professionals-realtors" ? (
          <Card className="border-indigo-200 bg-indigo-50">
            <h2 className="text-base font-bold text-indigo-900">
              Real estate agent profile
            </h2>
            <p className="mt-1 text-sm text-indigo-900">
              Service areas, licence, specialties, awards, closed sales and
              detailed client ratings live on their own page.
            </p>
            <LinkButton href="/dashboard/agent" className="mt-3">
              Add my agent credentials
            </LinkButton>
          </Card>
        ) : null}

        <Card>
          <BusinessProfileForm
            business={business}
            categories={categories}
            defaultCategory={searchParams.category}
            defaultSubcategory={searchParams.subcategory}
            defaultProfileType={
              searchParams.type === "professional" ? "PROFESSIONAL" : "BUSINESS"
            }
            canFeatureSpecialty={effectivePlan(user) !== "FREE"}
          />
        </Card>
      </div>

      <aside className="hidden w-[300px] shrink-0 space-y-4 lg:block">
        <ListingHelp username={user.username} />
        <PostingSidebar />
      </aside>
    </div>
  );
}
