import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { getCategoryTree } from "@/lib/directory";
import { BusinessProfileForm } from "@/components/forms/BusinessProfileForm";
import { Card } from "@/components/ui";
import { MAX_VIDEO_LIMIT, albumPhotoLimit } from "@/lib/plans";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Staff edit — business card",
  robots: { index: false },
};

/** Lets admins and moderators edit any card straight from its public page. */
export default async function StaffBusinessEditPage({
  params,
}: {
  params: { slug: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(`/admin/business/${params.slug}`)}`,
    );
  }
  if (!isStaff(user)) notFound();

  const [business, categories] = await Promise.all([
    db.business.findUnique({
      where: { slug: params.slug },
      include: {
        vehicle: true,
        owner: {
          select: {
            email: true,
            plan: true,
            planExpiresAt: true,
            foundingNumber: true,
          },
        },
      },
    }),
    getCategoryTree(),
  ]);
  if (!business) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Staff edit — {business.name}</h1>
        <Link
          href={`/b/${business.slug}`}
          className="text-sm font-semibold text-indigo-600 hover:underline"
        >
          View card →
        </Link>
      </div>
      <p className="text-sm text-slate-600">
        Owner: {business.owner?.email ?? "unclaimed"} · Plan:{" "}
        {business.owner?.plan ?? "—"} · Status: {business.status}
      </p>

      <Card>
        <BusinessProfileForm
          business={business}
          vehicle={
            business.vehicle
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
          defaultCountry={business.country ?? ""}
          canFeatureSpecialty
          extraCategoryLimit={20}
          foundingMember
          staffEdit
          videoLimit={MAX_VIDEO_LIMIT}
          albumPhotoLimit={albumPhotoLimit(business.owner)}
        />
      </Card>
    </div>
  );
}
