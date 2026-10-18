import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { can, getCurrentUser } from "@/lib/auth";
import { PLANS, listingImageLimit } from "@/lib/plans";
import { ListingForm } from "@/components/forms/ListingForm";
import { Card } from "@/components/ui";
import { requestCurrency } from "@/lib/currency";
import { marketplaceCategories } from "@/lib/listingsQueries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Edit your listing",
  robots: { index: false },
};

/** The poster's own edit page for any listing type. */
export default async function EditListingPage({
  params,
}: {
  params: { slug: string };
}) {
  const user = await getCurrentUser();
  if (!user)
    redirect(
      `/login?next=${encodeURIComponent(`/listings/${params.slug}/edit`)}`,
    );

  const listing = await db.listing.findUnique({
    where: { slug: params.slug },
    include: {
      images: { orderBy: { sortOrder: "asc" }, select: { url: true } },
    },
  });
  if (!listing) notFound();
  if (listing.ownerId !== user.id && !can(user, "listings")) notFound();

  const categories = await marketplaceCategories();

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">✏️ Edit your listing</h1>
        <Link
          href={`/listings/${listing.slug}`}
          className="text-sm font-semibold text-indigo-600"
        >
          ← Back to the listing
        </Link>
      </div>
      <Card>
        <ListingForm
          defaultKind={listing.kind}
          imageLimit={Math.max(listingImageLimit(user), listing.images.length)}
          paidImageLimit={PLANS.PRO.mediaLimit}
          defaultWhatsapp={listing.whatsapp}
          defaultCurrency={requestCurrency()}
          categories={categories}
          defaultGroup={listing.propertyGroup ?? undefined}
          listing={listing}
        />
      </Card>
    </div>
  );
}
