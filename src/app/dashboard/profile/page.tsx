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
import { effectivePlan, extraCategoryLimit } from "@/lib/plans";
import { requestCountry } from "@/lib/currency";
import { SignOutButton } from "@/components/SignOutButton";

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
    db.business.findUnique({
      where: { ownerId: user.id },
      include: { vehicle: true },
    }),
    getCategoryTree(),
  ]);

  return (
    <div className="flex justify-center gap-6">
      <div className="min-w-0 max-w-3xl flex-1 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">
            {business ? "Edit your digital card" : "Create your digital card"}
          </h1>
          <SignOutButton />
        </div>
        {isAgentCard(business?.subcategorySlug ?? null) ||
        searchParams.subcategory === "real-estate-property-dealers" ? (
          <Card className="border-indigo-200 bg-indigo-50">
            <h2 className="text-base font-bold text-indigo-900">
              Real estate agent profile
            </h2>
            <p className="mt-1 text-sm text-indigo-900">
              Service areas, licence, specialties, awards, closed sales and
              detailed client ratings live on their own page.
            </p>
            {business ? (
              <LinkButton href="/dashboard/agent" className="mt-3">
                Add my agent credentials
              </LinkButton>
            ) : (
              <p className="mt-3 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-indigo-900">
                Fill in and save the card below first — the agent page opens as
                soon as it exists.
              </p>
            )}
          </Card>
        ) : null}

        <Card>
          <BusinessProfileForm
            business={business}
            vehicle={
              business?.vehicle
                ? {
                    vehicleType: business.vehicle.vehicleType,
                    make: business.vehicle.make,
                    model: business.vehicle.model,
                    year: String(business.vehicle.year),
                    mileage:
                      business.vehicle.mileage === null
                        ? ""
                        : String(business.vehicle.mileage),
                    mileageUnit: business.vehicle.mileageUnit,
                    fuelType: business.vehicle.fuelType ?? "",
                    transmission: business.vehicle.transmission ?? "",
                    ownership: business.vehicle.ownership ?? "",
                    condition: business.vehicle.condition ?? "",
                    price:
                      business.vehicle.price === null
                        ? ""
                        : String(business.vehicle.price),
                    currency: business.vehicle.currency,
                    negotiable: business.vehicle.negotiable,
                    features: business.vehicle.features,
                    documents: business.vehicle.documents,
                  }
                : undefined
            }
            categories={categories}
            defaultCategory={searchParams.category}
            defaultSubcategory={searchParams.subcategory}
            defaultProfileType={
              searchParams.type === "professional" ? "PROFESSIONAL" : "BUSINESS"
            }
            defaultCountry={requestCountry()}
            canFeatureSpecialty={effectivePlan(user) !== "FREE"}
            extraCategoryLimit={extraCategoryLimit(user)}
            foundingMember={user.foundingNumber !== null}
          />
        </Card>
      </div>

      <aside className="hidden w-[260px] shrink-0 space-y-4 lg:order-first lg:block">
        <ListingHelp username={user.username} />
        <PostingSidebar />
      </aside>
    </div>
  );
}
