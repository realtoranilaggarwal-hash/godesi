import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ListingKind } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { mediaLimit } from "@/lib/plans";
import { ListingForm } from "@/components/forms/ListingForm";
import { Card } from "@/components/ui";
import { requestCurrency } from "@/lib/currency";
import { marketplaceCategories } from "@/lib/listings";
import { isPropertyGroup } from "@/lib/property";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Post a property, room or item — free listing",
  description:
    "List a home for sale or rent, a room to share or something to sell. Free, with photos, video and WhatsApp contact. Fair housing rules apply.",
  alternates: { canonical: "/listings/new" },
};

const KINDS: ListingKind[] = [
  "PROPERTY_SALE",
  "PROPERTY_RENT",
  "ROOM_OFFERED",
  "ROOM_WANTED",
  "MARKETPLACE",
];

export default async function NewListingPage({
  searchParams,
}: {
  searchParams: { kind?: string; group?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/listings/new");

  const [business, categories] = await Promise.all([
    db.business.findUnique({
      where: { ownerId: user.id },
      select: { whatsappNumber: true, phone: true },
    }),
    marketplaceCategories(),
  ]);

  const kind = KINDS.includes(searchParams.kind as ListingKind)
    ? (searchParams.kind as ListingKind)
    : "PROPERTY_SALE";
  const group =
    searchParams.group && isPropertyGroup(searchParams.group)
      ? searchParams.group
      : undefined;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Post a listing</h1>
        <p className="text-sm text-slate-600">
          A home to sell or rent, a room to share, or anything you want to sell —
          jewellery, clothes, furniture, electronics. A minute, and free.
        </p>
      </div>
      <Card>
        <ListingForm
          defaultKind={kind}
          imageLimit={mediaLimit(user)}
          defaultWhatsapp={business?.whatsappNumber ?? business?.phone ?? ""}
          defaultCurrency={requestCurrency()}
          categories={categories}
          defaultGroup={group}
          defaultCountry={requestCurrency() === "INR" ? "India" : "United States"}
        />
      </Card>
    </div>
  );
}
